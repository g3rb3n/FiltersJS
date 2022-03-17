class RangeSliders {

	constructor() {
		this.filtersInstance = null;
	}

	buildContainerHtml(property, filter, $filter) {
		let $fs = $('<fieldset>')
			.attr('data-filter-property', property)
			.attr('data-filter-type', filter.type)
			.appendTo($filter);
		$('<label>')
			.attr('for', `${property}-min`)
			.html(filter.labelMin)
			.appendTo($fs);
		$('<input>')
			.attr('name', `${property}-min`)
			.attr('data-filter-min', true)
			.appendTo($fs);
		$('<label>')
			.attr('for', `${property}-max`)
			.html(filter.labelMax)
			.appendTo($fs);
		$('<input>')
			.attr('name', `${property}-max`)
			.attr('data-filter-max', true)
			.appendTo($fs);
	}

	buildValuesHtml(property, values, filter, $filter) {
		let instance = this.filtersInstance;
		let $elemMin = $filter.find('[data-filter-min]');
		let $elemMax = $filter.find('[data-filter-max]');
		console.assert($elemMin.length == 1, `RangeSliders.buildValuesHtml: Could not find UI element for ${property} min`)
		console.assert($elemMax.length == 1, `RangeSliders.buildValuesHtml: Could not find UI element for ${property} max`)
		this.buildSlider($elemMin, values, $filter);
		this.buildSlider($elemMax, values, $filter);
		$elemMin.attr('value', values[0]);
		$elemMax.attr('value', values[values.length-1]);
		$elemMin.change(e => {
			$elemMax.attr('data-filter-min-value', $elemMin.val());
		});
		$elemMax.change(e => {
			$elemMin.attr('data-filter-max-value', $elemMax.val());
		});
	}

	buildSlider($elem, values, $filter) {
		let instance = this.filtersInstance;
		$elem.attr('type', 'range');
		$elem.attr('min', values[0]);
		$elem.attr('max', values[values.length-1]);
		let $elemMin = $filter.find('[data-filter-min]');
		let $elemMax = $filter.find('[data-filter-max]');
		$elem.change(e => {
			let min = $elem.attr('data-filter-min-value');
			let max = $elem.attr('data-filter-max-value');
			if (min && $elem.val() < min) $elem.val(min);
			if (max && $elem.val() > max) $elem.val(max);
			$('[data-filter-last-clicked]').removeAttr('data-filter-last-clicked');
			$elem.attr('data-filter-last-clicked', true);
			instance.filter();
		});
	}

	collectCondition(property, filter, $filter) {
		let condition = {}
		let $elemMin = $filter.find('[data-filter-min]');
		let $elemMax = $filter.find('[data-filter-max]');
		if ($elemMin.val() != '') condition.min = $elemMin.val();
		if ($elemMax.val() != '') condition.max = $elemMax.val();
		if (Object.keys(condition).length) return condition;
		return;
	}

	disableUnavailable(property, available, filter, $filter) {
		let instance = this.filtersInstance;
		let min = available[0];
		let max = available[available.length-1];
		let $elemMin = $filter.find('[data-filter-min]');
		let $elemMax = $filter.find('[data-filter-max]');
		$elemMin.attr('data-filter-max-available-value', max ? max : '');
		$elemMax.attr('data-filter-min-available-value', min ? min : '');
		instance.debug(`RangeSliders: disable ${available}`)
		instance.debug(`RangeSliders: disable ${property} min: ${!available} || ${$elemMin.val()} > ${max}`)
		instance.debug(`RangeSliders: disable ${property} max: ${!available} || ${$elemMax.val()} < ${min}`)
		instance.setRemoveAttr($elemMin, 'data-filter-disabled', max == undefined || $elemMin.val() > max);
		instance.setRemoveAttr($elemMax, 'data-filter-disabled', min == undefined || $elemMin.val() < min);
	}

}
