/*!
 * Copyright 2021, Halil Ibrahim Ercelik
 * Released under the MIT License
 * {@link https://github.com/halillusion/vpjax GitHub}
 * Inspired by defunkt's jQuery-Pjax
 */

class vPjax {

  // Define basic parameters and initialize class
  constructor (options, wrap = null) {

    this.version = '0.7.0'

    this.options = {
      selector: null,
      wrap: null,
      formSelector: null,
      url: null,
      cacheExpire: 300,
      timeOut: 1000,
    }

    if (wrap !== null) {
      this.options.wrap = wrap
    }

    if (typeof options !== 'object') {
      this.options.selector = options
      if (wrap === null) {
        console.error("Wrapper is not defined!");
      } 
    } else {
      this.mergeObject(this.options, options)
    }
    
    this.fetch = null
    this.method = 'GET'
    this.formData = null

    window.vPjax = {}

    window.onpopstate = (e) => this.getBack(e)
    return this
  }

  // Add event listener for targets.
  init () {
    let links = document.querySelectorAll(this.options.selector)
    for (let i = 0; i < links.length; i++) {
      links[i].addEventListener("click", (e) => {
        this.handler(e, links[i])
      })
    }

    if (this.options.formSelector) {
      let forms = document.querySelectorAll(this.options.formSelector)
      for (let i = 0; i < forms.length; i++) {
        forms[i].addEventListener("submit", (e) => {
          this.formHandler(e, forms[i])
        })
      }
    }

    return this
  }

  // Provides synchronization of setting data.
  mergeObject(defaultObj, overridedObj, key = null) {
    
    if (defaultObj !== null && overridedObj !== null) {
      const keys = Object.keys(overridedObj)
      let key = null

      for (let i = 0; i < keys.length; i++) {
        key = keys[i]
        if (! defaultObj.hasOwnProperty(key) || typeof overridedObj[key] !== 'object') defaultObj[key] = overridedObj[key];
        else {
          defaultObj[key] = this.mergeObject(defaultObj[key], overridedObj[key], key);
        }
      }

    } else {
      defaultObj = overridedObj
    }
    return defaultObj;

  }

  // Handle the click event.
  handler (event, element) {

    // Ignore for hash-only addresses.
    if ( element.getAttribute('href') === '#') 
      return

    let href = this.urlCheck(element.getAttribute('href'));

    if (href === null) {
      console.error("File protocol doesn't supported!")
      return
    }

    if (href === false) {
      return
    }

    const link = new URL(href)

    // Middle click, command click, and control click should open links in a new tab as normal.
    if ( event.ctrlKey || event.shiftKey || event.altKey || event.metaKey || event.which > 1 ) 
      return

    // Ignore cross origin links
    if ( location.protocol !== link.protocol || location.hostname !== link.hostname ) {
      location.href = link 
      return
    }

    // Ignore case when a hash is being tracked on the current URL
    if ( link.href.indexOf('#') > -1 && this.stripHash(link) === this.stripHash(location) ) 
      return

    // The click event is generated.
    const clickEvent = new CustomEvent('vPjax:click', {detail: {options: this.options}});
    document.dispatchEvent(clickEvent);

    // Preparing header contents
    this.formData = null
    this.method = 'GET'

    // Get
    this.get(link)
    event.preventDefault()
    return this
  }

  // URL checker
  urlCheck(url) {
    // url pattern
    const pattern = /(?:^|\s)((https?:\/\/)?(?:localhost|[\w-]+(?:\.[\w-]+)+)(:\d+)?(\/\S*)?)/g
    if (pattern.exec(url)) {
      return url
    } else if (window.location.protocol == "file:") {
      return null
    } else {
      url = window.location.origin + url
      return pattern.exec(url) ? url : false
    }

  }

  // Reload to direct link or current page
  reload(url = null) {
    this.method = "GET"
    this.formData = null
    if (url === null) url = location.href
    this.get(url);
  }

  // Handle the click event.
  formHandler (event, element) {

    // Ignore for hash-only addresses.
    if ( element.getAttribute('action') === '#') 
      return

    // Preparing link
    let link = element.getAttribute('action')
    if (link.indexOf(location.origin) === -1) {
      link = location.origin + (link.substring(0,1) === '/' ? '' : '/') + link
    }

    // Preparing header contents
    this.formData = new FormData(element)
    let method = element.getAttribute('method').toUpperCase()
    if (method === 'GET') {
      return
    }
    this.method = 'POST'

    // Creating event
    const submitEvent = new CustomEvent('vPjax:submit', {detail: {options: this.options}});
    document.dispatchEvent(submitEvent);

    this.get(link)
    event.preventDefault()
    return this
  }

  async get (url) {

    // Creating beforeSend event.
    const beforeSendEvent = new CustomEvent('vPjax:beforeSend', {detail: {options: this.options, url: url}});
    document.dispatchEvent(beforeSendEvent);

    const controller = new AbortController()
    this.options.url = url

    let timer
    if (this.options.timeOut) {
      timer = setTimeout(() => {
        if (! this.fetch) {

          // Creating timeout event.
          const timeoutEvent = new CustomEvent('vPjax:timeout', {detail: {options: this.options, fetch: controller}});
          document.dispatchEvent(timeoutEvent);

          controller.abort()
          location.href = this.options.url
          clearTimeout(timer);
        }
      }, this.options.timeOut);
    }

    // Creating start event.
    const startEvent = new CustomEvent('vPjax:start', {detail: {options: this.options, abort: controller}});
    document.dispatchEvent(startEvent);

    let fetchOptions = {
      method: this.method,
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'X-VPJAX': true
      },
      redirect: 'follow',
      referrerPolicy: 'same-origin',
      signal: controller.signal
    }

    if (this.formData) {
      fetchOptions['body'] = this.formData
    }

    this.fetch = await fetch(this.options.url, fetchOptions).then(function (response) {

      if (response.headers.get('refresh')) {
        let refresh = response.headers.get('refresh').replace(' ', '')
        window.vPjax.refresh = refresh.split(";url=")
      }

      if (response.headers.get('location')) {
        window.vPjax.location = response.headers.get('location')
      }

      return response.ok ? response.text() : false

    }).then(function (response) {

      // Creating success event.
      const successEvent = new CustomEvent('vPjax:success', {detail: {dom: response.dom}});
      document.dispatchEvent(successEvent);
      return response

    }).catch(function (err) {

      // Creating error event.
      const errorEvent = new CustomEvent('vPjax:error', {detail: {error: err}});
      document.dispatchEvent(errorEvent);
      throw err
      return false

    })

    if (window.vPjax.location) {
      let locationUrl = this.urlCheck(window.vPjax.location)
      this.get(locationUrl)
      window.vPjax.location = null
      return this
    }

    if (window.vPjax.refresh) {
      let refreshUrl = this.urlCheck(window.vPjax.refresh[1])
      setTimeout(() => {
        this.get(refreshUrl)
      }, (parseInt(window.vPjax.refresh[0]) * 1000))
      window.vPjax.refresh = null
    }
    
    if (this.fetch) {

      // Extracting.
      this.loadContent(this.fetch)
      if (this.options.timeOut) {
        clearTimeout(timer);
      }
      this.fetch = null
    } else {

      // Force redirect.
      // location.href = this.options.url
    }
    return this
  }

  loadContent (html, back = false) {

    const parser = new DOMParser()
    let dom = parser.parseFromString(html, 'text/html')
    let wrap = dom.querySelector(this.options.wrap)

    if (wrap) {

      let currentWrap = document.querySelector(this.options.wrap)

      if (currentWrap) {

        // Creating beforeExtract event.
        const beforeExtractEvent = new CustomEvent('vPjax:beforeExtract', {detail: {options: this.options, dom: dom}});
        document.dispatchEvent(beforeExtractEvent);

        let inner = wrap.innerHTML
        let title = document.querySelector("title").textContent;
        currentWrap.innerHTML = inner
        title = dom.querySelector("title").textContent

        if (title) {
          document.querySelector("title").textContent = title
        }

        let url = new URL(this.options.url);

        if (back) 
          window.history.back(-1);
        else 
          window.history.pushState({}, '', url);

        // Creating finish event.
        const finishEvent = new CustomEvent('vPjax:finish', {detail: {options: this.options, url: url}});
        document.dispatchEvent(finishEvent);

        this.init()

      } else {
        // Force redirect because element does not exist.
        location.href = this.options.url
        throw "The element specified as selector does not exist!"

      }
    } else {
      // Force redirect because server response not correct.
      location.href = this.options.url
      throw "Server response is not correct! -> " + html
    }
    return this
  }

  // Returns the "href" component of the given URL object, with the hash removed.
  stripHash(location) {
    return location.href.replace(/#.*/, '')
  }

  // Form submit
  form (selector) {
    this.options.formSelector = selector;
    return this
  }

  getBack (event) {

    // Creating popstate event.
    const popStateEvent = new CustomEvent('vPjax:popstate', {detail: {options: this.options, url: document.location}});
    document.dispatchEvent(popStateEvent);
    this.get(document.location)
  }
}