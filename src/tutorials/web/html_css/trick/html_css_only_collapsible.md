# HTML-and-CSS-only collapsible

<!--description:Learn how to make a collapsible container with only HTML and CSS.-->

While making this website, I decided to reduce to the absolute minimum the usage of Javascript.
This implied that the navigation on this website **had** to work without Javascript.

Why?

Well, Javascript is a powerful tool! It can store data and do some processing entirely client-side,
which is really useful for some client-side web applications.  
The issue is: some of its applications can be questionable: 
some will use it to do some tracking on users, which is why some people will choose to disable it.
It also requires more processing than purely HTML & CSS.
Since, HTML 5 and CSS 3 got released, with always more features: animations, better selectors, and more.
A lot of websites continue to use Javascript while not necessarily needing it for every part.

To come back the the navigation part: this website uses a side navigation, on desktop it's fine.
Though, on mobile it has some issues, it needs to be hidden away *(collapsed)*.

I found the solution after visiting Wikipedia, which uses the same trick.

[[ToC]]

## The theory

Let's look into some HTML components and CSS selectors.

HTML checkboxes have some specific behaviors: when a user clicks on it, it gets checked and vice-versa.
And we can check if a checkbox is checked with a CSS selector `:checked`.

The other specific behavior comes from labels which are linked to a checkbox,
when clicking a `<label>` targetting a checkbox, it will act as if the checkbox was clicked.

And last, we can select neighbor elements in CSS with `~`.

I think you might see where I'm going with this.

If you don't: the goal is to use a hidden checkbox to store the open/close state, and labels for the triggers.

## The HTML

Let's see how we can do it in HTML, first we can enclose the entire thing in a `<div>` to simplify it.  
Then we will have 3 elements: the hidden checkbox, the content to display, and a trigger.

```html
<div class="collapsible_wrapper">
	<input type="checkbox" id="first_collapsible_trigger" class="collapsible_internal_trigger"
		aria-hidden="true">

	<label for="first_collapsible_trigger" class="collapsible_trigger">
		Click here!
	</label>

	<div class="collapsible_content">
		<p>Hello world!</p>
	</div>
</div>
```

## The CSS

Now that we have the HTML, we can focus on the stylesheet.  
The goal is to always hide the checkbox, and to hide the content depending on the state of the checkbox.

```css:apply
/* Avoid weird spacing. */
.collapsible_wrapper {
	display: flex;
	flex-direction: column;
}

/* We hide the checkbox. */
.collapsible_internal_trigger {
	display: none;
}

.collapsible_trigger {
	cursor: pointer;
	color: crimson;
}

/* We hide the content by default. */
.collapsible_content {
	visibility: collapse;
	height: 0;
}

/* When the collapsible is opened, display the content. */
.collapsible_internal_trigger:checked ~ .collapsible_content {
	visibility: visible;
	height: 100%;
}
```

## Result

---

<div class="collapsible_wrapper">
	<input type="checkbox" id="first_collapsible_trigger" class="collapsible_internal_trigger" aria-hidden="true">

	<label for="first_collapsible_trigger" class="collapsible_trigger">
		Click here!
	</label>

	<div class="collapsible_content">
		<p>Hello world!</p>
	</div>
</div>

---

## Going further

### Animation

Ok, maybe we want to animate now, let's take the same HTML but with `_anim` appended to the contant class,
and a different CSS stylesheet:

```css:apply
/* We hide the content by default. */
.collapsible_content_anim {
	visibility: collapse;
	height: 0;
	transform: translateX(-100%);
	opacity: 0;
	transition: transform 500ms ease, opacity 500ms ease;
}

/* When the collapsible is opened, display the content. */
.collapsible_internal_trigger:checked ~ .collapsible_content_anim {
	visibility: visible;
	height: 100%;
	transform: translateX(0%);
	opacity: 100%;
}

/* Remove animations if the user prefers reduced motion. */
@media (prefers-reduced-motion) {
	.collapsible_content_anim {
		transition: none;
	}
}
```

**Warning:** you cannot use dimension transitions with percentage values for some reason.
It's one of the very frustrating things as using absolute values is quite bad.

#### Result

---

<div class="collapsible_wrapper">
	<input type="checkbox" id="anim_collapsible_trigger" class="collapsible_internal_trigger" aria-hidden="true"></input>

	<label for="anim_collapsible_trigger" class="collapsible_trigger">
		Click here!
	</label>

	<div class="collapsible_content_anim">
		<p>Hello world!</p>
	</div>
</div>

---

### Sidenav

Now, let's see how I did my side navigation. 

First, instead of having only one trigger there is 2 of them: one to open and one to close.
Then the content takes a whole side of the screen.

```html
<div class="ls_sidenav_wrapper">
	<input type="checkbox" id="example_nav_trigger" class="ls_sidenav_internal_trigger" 
		aria-hidden="true">
	<div id="example_nav" class="example_sidenav">
		Hello world!
		<p>
			To close this sidenav, please click on the darkened area!
		</p>
	</div>
	<label for="example_nav_trigger" class="ls_btn" ls_variant="fab" aria-role="menu" aria-label="Menu" aria-description="Open the example navigation menu.">
		☰
	</label>
	<label for="example_nav_trigger" class="example_sidenav_darkened"></label>
</div>
```

```css:apply
.example_sidenav {
	/* We position the sidenav on the right, in a way so it takes the entire height. */
	position: fixed;
	top: 0;
	right: 0;
	margin: 0;
	height: 100%;
	max-width: 260px;
	min-width: 260px;

	background-color: var(--ls_theme_background_accentuated);
	overflow-y: auto;

	padding: 2px 4px;

	z-index: 128; /* We want the sidenav to be on top. */

	visibility: hidden;
	transform: translateX(+150%); /* Would be -150% if the sidenav was on the left. */

	transition: transform 500ms ease, visibility 500ms ease;
}

/* The darkened area, it covers the entire screen, is under the sidenav area */
.example_sidenav_darkened {
	visibility: hidden;
	opacity: 0;
	position: fixed;
	background-color: rgba(0, 0, 0, 0.4);
	cursor: pointer;
	z-index: 64;

	top: 0;
	bottom: 0;
	right: 0;
	left: 0;
}

.ls_sidenav_internal_trigger:checked ~ .example_sidenav {
	visibility: visible;
	transform: translateX(0%);
}

.ls_sidenav_internal_trigger:checked ~ .example_sidenav_darkened {
	visibility: visible;
	opacity: 100%;
	transition: opacity 500ms ease, visibility 500ms ease;
	transform: translateX(0%);
}

/* Remove animations if the user prefers reduced motion. */
@media (prefers-reduced-motion) {
	.example_sidenav {
		transition: none;
	}
}
```

#### Result

And voilà!

Here's a collapsible side navigation which opens from the right:

<div class="ls_sidenav_wrapper" style="display: flex; flex-direction: column;">
	<input type="checkbox" id="example_nav_trigger" class="ls_sidenav_internal_trigger" aria-hidden="true">
	<div id="example_nav" class="example_sidenav">
		Hello world!
		<p>
			To close this sidenav, please click on the darkened area!
		</p>
	</div>
	<label for="example_nav_trigger" class="ls_btn" ls_variant="fab" aria-role="menu" aria-label="Menu" aria-description="Open the example navigation menu." style="align-self: center">
		☰
	</label>
	<label for="example_nav_trigger" class="example_sidenav_darkened"></label>
</div>

## Conclusion

Now you too have the knowledge of Javascript-less collapsible containers!

I hope it will help you some way, but there are more things to note:

Some of the basic examples I've shown could be replaced with the `<details>` HTML element,
it has the same purpose and fulfills it better semantically.  
The way it works is you define a `<details>` container, with a `<summary>` child element,
which contains elements that are always displayed and serves as a trigger, the other child elements are the content.

For example:

```html
<details>
	<summary>Click me!</summary>
	Hello world!
</details>
```

---

<details>
	<summary>Click me!</summary>
	Hello world!
</details>

---

So, the use case of this method would more be for dropdown menus, and side navigation that needs to be hidden on mobile.

There's also some limitations, for example making an animation changing the height of the content to display it smoothly
is not possible unless the height properties are hardcoded to specific values (no percentages!), it's quite awful to do.

If you do nesting, hardcoding those values can become quite an issue.

It's important to know limitations of the technologies we manipulate, despite those this trick is still pretty useful.
