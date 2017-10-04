<template>
  <select v-model="value">
    <option value="" disabled>Choose your option</option>
    <option v-for="Item in options">{{ Item }}</option>
    <label>{{ label }}</label>
  </select>
</template>

<script>
  export default {
    name: 'MaterialSelect',
    props: ['label', 'options', 'value'],
    mounted: function () {
      var vm = this
      window.$(this.$el).material_select()
      window.$(this.$el)
        .trigger('change')
        // emit event on change.
        .on('change', function () {
          vm.$emit('input', this.value)
          console.log(this.value)
        })
    },
    watch: {
      value: function (value) {
        // update value
        window.$(this.$el).val(value).trigger('change')
      },
      options: function (options) {
        // update options
        window.$(this.$el).empty().select({ data: options })
      }
    },
    destroyed: function () {
      window.$(this.$el).off().select('destroy')
    }
  }
</script>
