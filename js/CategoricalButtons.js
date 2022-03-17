class CategoricalButtons {

  constructor(config){
    this.filtersInstance = null;
  }

  extractConfig(){
    let instance = this.filtersInstance;
    let filters = {}
    instance.$filterElements.each(function(i){
      let $fieldset = $(this);
      let property = $fieldset.data('filter-property');
      let type = $fieldset.data('filter-type');
      let dataType = $fieldset.data('filter-data-type');
      let maxValues = $fieldset.data('filter-max-values');
      let filter = {};
      if (type) filter.type = type;
      if (dataType) filter.dataType = dataType;
      if (maxValues) filter.maxValues = maxValues;
      filters[property] = filter;
    });
    this.filters = instance.deepMerge(this.filters, filters);
  }

  buildContainerHtml(property, filter, $filter) {
    $('<fieldset>').attr('data-filter-property', property).attr('data-filter-type', filter.type).appendTo($filter);
  }

  buildValuesHtml(property, values, filter, $filter){
    let instance = this.filtersInstance;
    let $elem = $filter;
    console.assert($elem.length, `CategoricalButtons.buildValuesHtml: Could not find ${property}`);
    $elem.empty();
    values.forEach(function(value){
      let $button = $('<button>').text(value).attr('value',value);
      $elem.append($button);
      $button.click(function(){
        $('[data-filter-last-clicked]').removeAttr('data-filter-last-clicked');
        $button.parent('fieldset').attr('data-filter-last-clicked', true);
        instance.toggleAttr($button, 'data-filter-selected', 'selected');
        instance.filter();
      });
    });
  }

  collectCondition(property, filter, $filter){
    let condition = []
    $filter.find('button[data-filter-selected]').each(function(i){
      let value = $(this).val();
      if (filter.dataType === 'integer')
        value = parseInt(value);
      condition.push(value);
    });
    if (condition.length)
      return condition;
    return;
  }

  disableUnavailable(property, available, filter, $filter){
    let instance = this.filtersInstance;
    let $buttons = $filter.find('button');
    console.assert($buttons.length, `CategoricalButtons.disableUnavailabe: Could not find ${property}`);
    $buttons.each((i,button) => {
      let $button = $(button);
      let value = $button.val();
      if (filter.dataType === 'integer')
        value = parseInt(value);
      instance.debug(`CategoricalButtons: disable ${property} ${value} ${!available.includes(value)}`)
      instance.setRemoveAttr($button, 'data-filter-disabled', !available.includes(value));
    });
  }

}
