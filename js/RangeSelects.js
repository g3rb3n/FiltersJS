class RangeSelects {

  constructor() {
    this.filtersInstance = null;
  }

  build(property, values, filter, $filter) {
    let instance = this.filtersInstance;
    let $elemMin = $filter.find('[data-filter-min]');
    let $elemMax = $filter.find('[data-filter-max]');
    let selected = instance.selectWithEqualDistance(values, filter.maxValues);
    console.assert($elemMin.length == 1, `RangeSelects.build: Found ${$elemMin.length} UI elements for ${property} min, expected 1`)
    console.assert($elemMax.length == 1, `RangeSelects.build: Found ${$elemMax.length} UI elements for ${property} max, expected 1`)
    console.assert(selected.length, `RangeSelects.build: No selected values for ${property}`)
    this.buildSelectOptions($elemMin, selected);
    this.buildSelectOptions($elemMax, selected);
  }

  buildSelectOptions($elem, values) {
    let instance = this.filtersInstance;
    $elem.empty();
    $elem.append($('<option>').attr('value','').text('---'));
    values.forEach(function(value) {
      $elem.append($('<option>').attr('value',value).text(value));
    });
    $elem.hover(e => {
      $('[data-filter-last-clicked]').removeAttr('data-filter-last-clicked');
      $elem.attr('data-filter-last-clicked', true);
    });
    $elem.change(e => {
      $('[data-filter-last-clicked]').removeAttr('data-filter-last-clicked');
      $elem.attr('data-filter-last-clicked', true);
      $elem.find('option').removeAttr('data-filter-selected');
      let $option = $elem.find('option:selected');
      instance.toggleAttr($option, 'data-filter-selected', 'selected');
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
    let $optionsMin = $filter.find('[data-filter-min] option');
    let $optionsMax = $filter.find('[data-filter-max] option');
    console.assert($optionsMin.length, `RangeSelects.disableUnavailable: Could not find options for ${property} min`);
    console.assert($optionsMax.length, `RangeSelects.disableUnavailable: Could not find options for ${property} max`);
    console.assert(available.length, `RangeSelects.disableUnavailable: No values for ${property}`);
    let min = available[0];
    let max = instance.last(available);
    this.disableMinMaxSelectOptions($optionsMin, min, max, property);
    this.disableMinMaxSelectOptions($optionsMax, min, max, property);
  }

  disableMinMaxSelectOptions($options, minValue, maxValue, property) {
    let instance = this.filtersInstance;
    $options.each((i,option) => {
      let $option = $(option);
      let value = $option.val();
      let disabled = minValue == undefined || value < minValue || value > maxValue;
      instance.debug(`disable ${property} ${value} < ${minValue} || ${value} > ${maxValue} = ${disabled}`)
      instance.setRemoveAttr($option, 'data-filter-disabled', disabled);
    });
  }

}
