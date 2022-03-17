# Introduction
A simple html element filtering library based on javascript and jQuery.
Usefull if you have a list of elements with data properties that you want to show / hide based on user input.

- Filters html elements based on data properties and selection options in a form.
- Automatically generates form options.
- Tags data items that can be used in css to hide / blur / ...
- Uses plugins for UI elements.

# Usage:
## Filter HTML:
```
<div id='filters'>
	<div>
		<h2>Model</h2>
		<fieldset data-filter-property='model' data-filter-type='categorical'></fieldset>
	</div>

	<div>
		<h2>Price</h2>
		<fieldset data-filter-property='price' data-filter-type='range' data-filter-max-values=4>
			<label for='price-min'>From</label>
			<input name='price-min' data-filter-min></input>
			<label for='price-max'>To</label>
			<input name='price-max' data-filter-max></input>
		</fieldset>
	</div>
```
## Data HTML:
```
<ul id='data'>
	<li id='item1' data-price='10' data-model='m121'></li>
	<li id='item2' data-price='12' data-model='m121'></li>
	<li id='item3' data-price='12' data-model='m323'></li>
	<li id='item4' data-price='14' data-model='m323'></li>
	<li id='item5' data-price='14' data-model='m525'></li>
</ul>
```
## Script:
```
$(document).ready(function(){
	new Filters({
		filtersContainerSelector: '#filters',
		dataSelector: '#data li',
	});
});
```

# Configuration
## Configuration options:
```
filtersContainerSelector: string # the jQuery selector for the filters container, default: '#filters'
dataSelector: string # the jQuery selector for the data items, default: '#data li'
debug: true|false # verbose output, default: false
defaultSelected: true|false # set item selected when no filter options are enabled default: true
filters: object # filter configuration, by default build from filter html and data html
```
## Filter configuration options:
```
{
	<property>:{ # the property to use in a filter
		values: [], # the allowed filter values, usefull when a specific ordering is required
		type: 'buttons'|'min-max-select', #the two types of filters
		maxValues: <integer>, #the maximum number of values in a select box
	}
}
```
