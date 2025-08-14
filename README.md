# Introduction
A simple html element filtering library based on javascript and jQuery.
Usefull if you have a list of elements with data properties that you want to show / hide / highlight / ... based on user input.

- Filters html elements based on data properties and selection options in a form.
- Automatically generates form options.
- Tags data items that can be used in css to hide / blur / ...
- Uses plugins for UI elements.

## Supported Plugins
### Categorical
- CategoricalSelect old fashioned select box
- CategoricalButtons a button for every value
- CategoricalOneChoiceButtons buttons where only one value can be selected

### Range
- RangeSliders
- RangeSelects
- RangeButtons

# Requirements
ES6
jQuery

# Usage:
## Filter configuration in JavaScript

### Filter HTML:
```
<div id='filters'></div>
```

### Data HTML
```
<ul id='data'>
	<li id='item1' data-price='10' data-model='m121'></li>
	<li id='item2' data-price='12' data-model='m121'></li>
	<li id='item3' data-price='12' data-model='m323'></li>
	<li id='item4' data-price='14' data-model='m323'></li>
	<li id='item5' data-price='14' data-model='m525'></li>
</ul>
```

### Script:
```
$(document).ready(function(){
	new Filters({
		filtersContainerSelector: '#filters',
		dataSelector: '#data li',
		filters: {
			price: {
				type: 'range',
				label: 'Price',
				dataType: 'integer',
				labelMin: 'minimum',
				labelMax: 'maximum'
			},
			model: {
				'type': 'categorical',
				'label': 'Model'
			}
		}
	});
});
```

### CSS
```
li {
	opacity: 0.3;
}

li[data-filter-selected] {
	opacity: 1;
}
```

## Filter configuration in HTML:

### Filter HTML
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

### Script:
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
andComparison: true|false # comparison over filters, default true
filters: { object # filter configuration, build from filter html and data html
	<property>: <filter configuration object>
}
plugins: {
	<pluginName>: new <PluginClassName>(),
}
```
## Filter configuration options:
```
type: 'categorical'|'range', # the plugin to be used
values: [], # the allowed filter values, useful when a specific ordering is required
label: '', # the label
```
### Categorical options
```
dataType: 'integer', # the data type used for comparison and sorting
```
### Range options
```
labelMin: '', # the label for the minimum value
labelMax: '', # the label for the maximum value
```
#### RangeSelects and RangeButtons
```
maxValues: 3, #the maximum number of selectable values
```
