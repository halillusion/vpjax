# Vanilla JS + pushState = vPjax
You can save your visitors from reloading resources every time they switch pages. In addition, since the whole process is asynchronous, it will provide a great experience by providing a faster transition.

## How to Use?
So, it's very easy. You just need to instantiate a class where you mark the trigger selector and container element selector. 
You can also perform external actions by adding a listener for events that occur while running.
According to the `X-VPJAX` header that comes with the request in the server output, you can trim the parts that you do not want to be sent again.

```js

// When instantiating the class we send a flag to the constructor method pointing to the trigger and the container.
const vanillaPjax = new vPjax('a:not([target="_blank"])', '#wrap').init()
// Or we can send more flag as an object. As follows...
const vanillaPjax = new vPjax({
  selector: 'a:not([target="_blank"])', // element selector to be based on if clicked
  wrap: '#wrap', // container selector to base on query result
  formSelector: 'form[data-vpjax]', // form selector to be used as a basis for form submission operations
  cacheExpire: 500, // cache time in ms
  timeOut: 2000 // timeout in ms
}).init()

// And with form submit support.
const vanillaPjax = new vPjax('a:not([target="_blank"])', '#wrap').form('[data-vpjax]').init()

// You can also use it as below to reload the page.
vanillaPjax.reload(); // current
// or
vanillaPjax.reload("https://site-address.com"); // another
```
For events;
```js
document.addEventListener("vPjax:start", (e) => {
  // NProgress.start(); // If you are using a progress-bar library, you can use it as in the example.
})

document.addEventListener("vPjax:finish", (e) => {
  // NProgress.done(); // If you are using a progress-bar library, you can use it as in the example.
});

// Other events
document.addEventListener("vPjax:click", (e) => {
  // Actions to be taken when a click is received for the new page.
})

document.addEventListener("vPjax:submit", (e) => {
  // Actions to take when form submission is triggered.
})

document.addEventListener("vPjax:beforeSend", (e) => {
  // Actions to be taken just before the asynchronous request starts.
})

document.addEventListener("vPjax:timeout", (e) => {
  // Actions to take when timeout occurs.
})

document.addEventListener("vPjax:success", (e) => {
  // Actions to be taken when the server response is successfully received.
})

document.addEventListener("vPjax:beforeExtract", (e) => {
  // Actions to be taken before DOM update starts.
})

document.addEventListener("vPjax:error", (e) => {
  // Actions to take when an error occurs.
})

document.addEventListener("vPjax:popstate", (e) => {
  // Actions to be taken when going backwards or forwards.
})
```

You can perform server-side request control on the server as in the example below.
```php
  
  if (isset($_SERVER['HTTP_X_VPJAX']) !== false) {
    // For new page loads with vPJAX.
  } else {
    // The part you will use for the first load.
  }
  
```
Inspired by: jquery-pjax [https://github.com/defunkt/jquery-pjax]
