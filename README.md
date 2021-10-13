# Vanilla JS + pushState = vPjax
You can save your visitors from reloading resources every time they switch pages. In addition, since the whole process is asynchronous, it will provide a great experience by providing a faster transition.

## How to Use?
So, it's very easy. You just need to instantiate a class where you mark the trigger selector and container element selector. 
You can also perform external actions by adding a listener for events that occur while running.
According to the `X-VPJAX` header that comes with the request in the server output, you can trim the parts that you do not want to be sent again.

```js

// When instantiating the class we send a flag to the constructor method pointing to the trigger and the container.
const vanillaPjax = new vPjax('a:not([target="_blank"])', '#wrap')

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
  // some actions
})

document.addEventListener("vPjax:beforeSend", (e) => {
  // some actions
})

document.addEventListener("vPjax:timeout", (e) => {
  // some actions
})

document.addEventListener("vPjax:success", (e) => {
  // some actions
})

document.addEventListener("vPjax:beforeExtract", (e) => {
  // some actions
})

document.addEventListener("vPjax:error", (e) => {
  // some actions
})

document.addEventListener("vPjax:popstate", (e) => {
  // some actions
})
```
Inspired by: jquery-pjax [https://github.com/defunkt/jquery-pjax]
