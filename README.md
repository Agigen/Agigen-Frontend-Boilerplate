# Agigen Frontend Boilerplate
### A Simple Way to Get Your New Frontend Project Started

Primarily built to be used in conjunction with our App Engine Boilerplate, our frontend boilerplate is a few-steps solution to get started with the frontend structure of your site or app.


#### How-to
Get started by simply running:

    $ npm install && bower install

When this is done, you'll already be set for writing some code goodness, but you'll most likely want to uncomment and include one or a few of the libraries listed in `scss/main.scss`. For library specific configuration, open up your `scss/libs/library-name` and edit away.

Also, you'll probably want to take a look at `frontend-config.json` which specifiec a few pretty much self-explanatory paths to be used inside the Grunt task, as well as an array of paths ("bowerLibs") to JavaScript libs to be automatically copied from the Bower directory to a `js/libs` folder in your static folder.

Then, you'll be fully ready to start writing some code, so go ahead and run the default grunt task to start a development build and watch task:

    $ grunt


#### Remarks
- For the time being, RequireJS will always be included with the boilerplate
