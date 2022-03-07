class RangeButtons {

  constructor() {
    this.filtersInstance = null;
  }

  build(property, values, filter, $filter) {
    let instance = this.filtersInstance;
    let $elemMin = $filter.find('[data-filter-min]');
    let $elemMax = $filter.find('[data-filter-max]');
    let selected = instance.selectWithEqualDistance(values, filter.maxValues);
    console.assert($elemMin.length == 1, `RangeButtons.build: Could not find UI element for ${property} min`)
    console.assert($elemMax.length == 1, `RangeButtons.build: Could not find UI element for ${property} max`)
    console.assert(values.length, `RangeButtons.build: No values for ${property}`)
    this.buildRangeButtons($elemMin, selected);
    this.buildRangeButtons($elemMax, selected);
  }

  buildRangeButtons($elem, values) {
    let instance = this.filtersInstance;
    $elem.empty();
    values.forEach(function(value) {
      let $button = $('<button>').text(value).attr('value',value).appendTo($elem);
      $button.click(function() {
        let selected = $button.is('[data-filter-selected]');
        $button.parent('div').find('button').removeAttr('data-filter-selected');
        $('[data-filter-last-clicked]').removeAttr('data-filter-last-clicked');
        $button.parent('div').attr('data-filter-last-clicked', true);
        instance.setRemoveAttr($button, 'data-filter-selected', !selected);
        instance.filter();
      });
    });
  }

  collectCondition(property, filter, $filter) {
    let instance = this.filtersInstance;
    let condition = {}
    let $elemMin = $filter.find('[data-filter-min] button[data-filter-selected]');
    let $elemMax = $filter.find('[data-filter-max] button[data-filter-selected]');
    if ($elemMin) condition.min = $elemMin.val();
    if ($elemMax) condition.max = $elemMax.val();
    if (Object.keys(condition).length) return condition;
    return;
  }

  disableUnavailable(property, available, filter, $filter) {
    let instance = this.filtersInstance;
    let $buttonsMin = $filter.find('[data-filter-min] button');
    let $buttonsMax = $filter.find('[data-filter-max] button');
    console.assert($buttonsMin.length, `RangeButtons.disableUnavailable: Could not find ${property}`);
    console.assert($buttonsMax.length, `RangeButtons.disableUnavailable: Could not find ${property}`);
    let min = available[0];
    let max = instance.last(available);
    this.disableMinMaxSelectButtons($buttonsMin, min, max, property);
    this.disableMinMaxSelectButtons($buttonsMax, min, max, property);
  }

  disableMinMaxSelectButtons($buttons, minValue, maxValue, property) {
    let instance = this.filtersInstance;
    $buttons.each((i,button) => {
      let $button = $(button);
      let value = $button.val();
      let disabled = minValue == undefined || value < minValue || value > maxValue;
      instance.debug(`RangeButtons: disable ${property} ${value} < ${minValue} || ${value} > ${maxValue} = ${disabled}`)
      instance.setRemoveAttr($button, 'data-filter-disabled', disabled);
    });
  }

}
