/*!
 * Copyright 2021, Halil Ibrahim Ercelik
 * Released under the MIT License
 * {@link https://github.com/halillusion/vpjax GitHub}
 * Inspired by defunkt's jQuery-Pjax
 */

class vPjax {

	// Define basic parameters and initialize class
	constructor (selector, wrap) {

		this.version = '0.2.0'
		this.options = {
			selector,
			wrap,
			url: null,
			cacheExpire: 300,
			timeOut: 1000,
		}
		this.fetch = null
		// this.store = {}

		// Init
		this.init()

		window.onpopstate = (e) => this.getBack(e)
	}

	// Add event listener for targets.
	init () {
		let links = document.querySelectorAll(this.options.selector)
		for (let i = 0; i < links.length; i++) {
			links[i].addEventListener("click", (e) => {
				e.preventDefault()
				this.handler(e, links[i])
			})
		}
	}

	// Handle the click event.
	handler (event, element) {

		// Ignore for hash-only addresses.
		if ( element.getAttribute('href') === '#') 
			return

		const link = new URL(element.getAttribute('href'))

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

		this.get(link)
		event.preventDefault()
	}

	async get (url) {

		const beforeSendEvent = new CustomEvent('vPjax:beforeSend', {detail: {options: this.options, url: url}});
		document.dispatchEvent(beforeSendEvent);

		const controller = new AbortController()
		this.options.url = url

		let timer
		if (this.options.timeOut) {
			timer = setTimeout(() => {
				if (! this.fetch) {

					const timeoutEvent = new CustomEvent('vPjax:timeout', {detail: {options: this.options, fetch: controller}});
					document.dispatchEvent(timeoutEvent);

					controller.abort()
					location.href = this.options.url
					clearTimeout(timer);
				}
			}, this.options.timeOut);
		}

		const startEvent = new CustomEvent('vPjax:start', {detail: {options: this.options, abort: controller}});
		document.dispatchEvent(startEvent);

		this.fetch = await fetch(url, {
			method: 'GET',
			mode: 'cors',
			cache: 'no-cache',
			credentials: 'same-origin',
			headers: {
			  'X-VPJAX': true
			},
			redirect: 'follow',
			referrerPolicy: 'same-origin',
			signal: controller.signal
		}).then(function (response) {
			return response.ok ? response.text() : false
		}).then(function (dom) {
			const successEvent = new CustomEvent('vPjax:success', {detail: {dom: dom}});
			document.dispatchEvent(successEvent);
			return dom
		}).catch(function (err) {
			const errorEvent = new CustomEvent('vPjax:error', {detail: {error: err}});
			document.dispatchEvent(errorEvent);
			throw err
			return false
		})

		if (this.fetch) {
			this.loadContent(this.fetch)
			if (this.options.timeOut) {
				clearTimeout(timer);
			}
			this.fetch = null
		} else {
			location.href = this.options.url
		}
	}

	loadContent (html, back = false) {
		const parser = new DOMParser()
		let dom = parser.parseFromString(html, 'text/html')
		let wrap = dom.querySelector(this.options.wrap)
		if (wrap) {
			let currentWrap = document.querySelector(this.options.wrap)
			if (currentWrap) {

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
				if (back) window.history.back(-1);
				else window.history.pushState({}, '', url);

				const finishEvent = new CustomEvent('vPjax:finish', {detail: {options: this.options, url: url}});
				document.dispatchEvent(finishEvent);

				this.init()
			} else {
				location.href = this.options.url
				throw "The element specified as selector does not exist!"
			}
		} else {
			location.href = this.options.url
			throw "Server response is not correct! -> " + html
		}
	}

	// Returns the "href" component of the given URL object, with the hash removed.
	stripHash(location) {
		return location.href.replace(/#.*/, '')
	}

	getBack (event) {

		const popStateEvent = new CustomEvent('vPjax:popstate', {detail: {options: this.options, url: document.location}});
		document.dispatchEvent(popStateEvent);

		this.get(document.location)
	}
}
