# Welcome to this new blog!

<!--description: Welcome to this new blog! After some time I decided to finally get a blog so I can talk of various stuff whenever I want.-->
<!--author: lambdaurora-->
<!--tag: blog-->
<!--date: 2022-09-04-->

Welcome!

This is my blog, a place where I may talk about some random stuff, I can't say for sure what will be the subjects yet.  
It mays range from fun facts, devlogs, random rambling about stuff, or essays, whatever.

### How does this website work?

Ok, time to talk about this website since there's a blog. This website allow me to share my own opinions, [share knowledge](/tutorials "Tutorials *wink wink*"), [share my projects](/projects "Projects"), share some random online tools, sometimes even just to experiment some stuff with web technologies, etc.

As of the time of writing, the website is statically hosted on [GitHub Pages](https://pages.github.com/). This is very neat as hosting something myself was kind of hard, thought that might change in the future (who knows). But it also has its share of issues...  
One issue you might think of is... well... You can't really make anything dynamic. Everything need to be generated at deployment.

#### Custom Build Tools

To make a website, you honestly have a fair amount of frameworks available, and in almost any language you would want (but please, ignore that one forum software written in assembly).

Though, web technologies and me are not the best friends in the world.
I have some... *strong opinions* about them.

At the time of finally actually creating the website, I had written [lib.md](https://github.com/LambdAurora/lib.md), a Markdown parser/renderer written in JavaScript. Turns out I also made it capable of parsing and writing HTML since I tried to make it work with [Deno](https://deno.land/)... which doesn't have a working DOM.

I knew that I wanted to kind of use Markdown for some of the content I would write, and I knew that I didn't want to use Vue.js after my last venture.
I also knew that I wanted something that wouldn't require webpack to get everything working, I didn't want any magic tooling, I wanted to know how everything worked for once.

That... reduces *a lot* my choices.  
I ended up choosing making my own tooling, and using [Deno][deno].  
**This was risky** (and still is), making your own tooling exposes you to potential weird bugs that you would have to worry about yourself! And proof that it bites me back regularly, I tried to use the `[Deno]: https://deno.land/` syntax for linking the Deno pages on this blog post and for some reason the `[Deno]` syntax wasn't reconigizing the correct reference, as it's case-sensitive and somehow the reference got lower-cased...

Despite that it gave me some freedom, if I wanted a custom Markdown extension, I could just *make it*!

So here I started, I started small, making just the skeleton of each web pages to a template, and create the tutorial processor to read the markdown files and turn them into tutorial pages.

I also looked into using [SCSS](https://sass-lang.com/) to replace my one-file CSS file, it was becoming way too big and hard to manage. And the extra custom syntax it provides is really neat, like nesting *(may the [official CSS nesting syntax](https://www.w3.org/TR/css-nesting-1/) make it soon)*.

To debug all of that I expanded the build script into being able to launch a full HTTP server and auto-refresh if I modify any file.

After that I started working on a component system so I can write other pages directly in HTML and reduce the amount of repetition of structures so it makes tweaking or updating much easier (and less prone to errors).

And lately, I finally wrote the blog processor.

#### JavaScript is frustrating

Since I chose [Deno][deno]... I chose JavaScript.

This was both a blessing and a curse.

Why do I dare talk about a blessing? Well, the dynamic typing of JavaScript and its interpreted nature makes it very easy to put small snippets of it in component files (or others) and execute them at build time to process different things. It also simplifies development a lot since there's a bunch of stuff I didn't need to think about!

But then comes the curse... The terrible terrible curse.  
The thing with JavaScript is, it's rushed, and it's not good.
It has a lot of APIs that straight up don't make sense, or lot of <abbr title="Quality-of-Life">QoL</abbr> features that straight up don't exist.

I have a big Java background, I used Java for years. And when you come to JavaScript, and discover that to insert an element into an array you have to `array.splice(index, 0, element)`, it's kind of mind-boggling. Why isn't there an `insert` method?

While writing the blog processor, the thing that made me angry was the `Date` object.
I dared wanting to display the date the blog post was written (or modified).  
This means I need to `stat` the file for the modification date, and parse a date in the blog post. Everything's fine.
And here's come the `Date` method. `Date.getDay` doesn't return the day of month. It returns **the day of week**. And the actual method for the day of month is `Date.getDate` **which is not intuitive**.

*sighs*

You might argue that I'm wrong. Maybe I am! But I'd prefer a `getDayOfWeek` method and `getDay` returning the day of month.

#### Solving The Dynamic Issue

Now that I finished my ramble about web technologies, let's talk about solving one issue: having dynamic content in a statically-built website.

To those who it might be familiar, I maintain an [OptiFine alternatives list](/optifine_alternatives).
This specific project started as a simple Gist, which was fine at first, but it quickly got limited:
 - load times were terrible since the browser had to load all the comments and they were accumulating;
 - Chinese users had trouble accessing the Gist;
 - Markdown was severely limiting for displaying a list that was progressively getting more and more complex;
 - maintenance was tedious.

Thus started the GitHub repository variant with one goal: generate an actual web page for the list.
This goal had constraints:
 - keep a similar layout,
 - allow people to contribute (GitHub repository solved that, Gist doesn't have pull request features and having to manually maintain it was kind of tiring),
 - present the mods in a more intuitive and rich manner,
 - keep a comment section.

And that's how another [Deno][deno]-based project started.

Solving the comments issue was a bit hard. I had heard of [uterrances](https://utteranc.es/), a script to execute on the page to make the comments of a GitHub issue show up as the comments of the page. This was neat but had issues: it would require me to get an issue opened for discussion and not actual issues, it has the same issue as Gist comments which is replying has bad UI.

After searching for a long time I settled on [giscus](https://giscus.app/). Absolutely the same principle, *but* it's using GitHub discussion instead, which solve every issues I had, great!

And this is how I solved the dynamic issue of that page.

### Conclusion

To conclude this blog post, making this website from almost the ground up has been *a journey*, a long one.

But I think I'm beginning to be happy with the results, despite all the jank hidden behind.

[deno]: https://deno.land/
