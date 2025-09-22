<template>
  <div class="base-input" :class="inputClasses">
    <label v-if="label" :for="inputId" class="input-label">
      {{ label }}
      <span v-if="required" class="required-asterisk">*</span>
    </label>
    
    <div class="input-container">
      <div v-if="$slots.prefix || prefixIcon" class="input-prefix">
        <slot name="prefix">
          <Icon v-if="prefixIcon" :icon="prefixIcon" class="prefix-icon" />
        </slot>
      </div>
      
      <input
        :id="inputId"
        v-model="inputValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :min="min"
        :max="max"
        :step="step"
        :minlength="minlength"
        :maxlength="maxlength"
        :pattern="pattern"
        :autocomplete="autocomplete"
        class="input-field"
        :class="fieldClasses"
        :style="inputStyles"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
        @change="handleChange"
      />
      
      <div v-if="$slots.suffix || suffixIcon || clearable" class="input-suffix">
        <button
          v-if="clearable && inputValue"
          type="button"
          class="clear-button"
          @click="clearInput"
        >
          <Icon icon="mdi:close" class="clear-icon" />
        </button>
        
        <slot name="suffix">
          <Icon v-if="suffixIcon" :icon="suffixIcon" class="suffix-icon" />
        </slot>
      </div>
    </div>
    
    <div v-if="helpText || errorMessage" class="input-message">
      <span v-if="errorMessage" class="error-message">
        <Icon icon="mdi:alert-circle" class="message-icon" />
        {{ errorMessage }}
      </span>
      <span v-else-if="helpText" class="help-text">
        {{ helpText }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, useSlots } from 'vue'
import { Icon } from '@iconify/vue'
import { useSkinTheme } from '../../composables/useSkinTheme'

interface Props {
  modelValue?: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  label?: string
  placeholder?: string
  helpText?: string
  errorMessage?: string
  variant?: 'default' | 'filled' | 'outlined'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  clearable?: boolean
  prefixIcon?: string
  suffixIcon?: string
  min?: number
  max?: number
  step?: number
  minlength?: number
  maxlength?: number
  pattern?: string
  autocomplete?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  variant: 'default',
  size: 'md',
  disabled: false,
  readonly: false,
  required: false,
  clearable: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  input: [event: Event]
  change: [event: Event]
  clear: []
}>()

const slots = useSlots()

const { getPrimaryColor, getSecondaryColor, getEmergencyColor } = useSkinTheme()

// Generate unique ID for accessibility
const inputId = ref(`input-${Math.random().toString(36).substr(2, 9)}`)

// Internal value
const inputValue = ref(props.modelValue || '')
const isFocused = ref(false)

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  inputValue.value = newValue || ''
})

// Computed classes
const inputClasses = computed(() => [
  `input-${props.variant}`,
  `input-${props.size}`,
  {
    'input-disabled': props.disabled,
    'input-readonly': props.readonly,
    'input-focused': isFocused.value,
    'input-error': !!props.errorMessage,
    'input-has-prefix': !!props.prefixIcon || !!slots.prefix,
    'input-has-suffix': !!props.suffixIcon || !!slots.suffix || props.clearable
  }
])

const fieldClasses = computed(() => [
  {
    'field-error': !!props.errorMessage,
    'field-focused': isFocused.value
  }
])

const inputStyles = computed(() => ({
  '--primary-color-0': getPrimaryColor(0),
  '--primary-color-1': getPrimaryColor(1),
  '--secondary-color-0': getSecondaryColor(0),
  '--secondary-color-1': getSecondaryColor(1),
  '--secondary-color-2': getSecondaryColor(2),
  '--emergency-color': getEmergencyColor()
}))

// Event handlers
const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  inputValue.value = value
  emit('update:modelValue', value)
  emit('input', event)
}

const handleChange = (event: Event) => {
  emit('change', event)
}

const clearInput = () => {
  inputValue.value = ''
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<style scoped>
.base-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  font-weight: 500;
  color: var(--secondary-color-0);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.required-asterisk {
  color: var(--emergency-color);
  font-weight: 600;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-field {
  width: 100%;
  border: var(--border-width-thin) solid var(--secondary-color-2);
  border-radius: 8px;
  background: var(--primary-color-0);
  color: var(--secondary-color-0);
  font-size: 0.875rem;
  transition: all 0.2s ease;
  outline: none;
}

.input-field::placeholder {
  color: var(--secondary-color-1);
  opacity: 0.6;
}

.input-field:focus {
  border-color: var(--secondary-color-0);
  box-shadow: 0 0 0 3px var(--secondary-color-2);
}

.input-field:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--primary-color-1);
}

.input-field:read-only {
  background: var(--primary-color-1);
  cursor: default;
}

/* Variants */
.input-default .input-field {
  background: var(--primary-color-0);
  border: var(--border-width-thin) solid var(--secondary-color-2);
}

.input-filled .input-field {
  background: var(--primary-color-1);
  border: var(--border-width-thin) solid transparent;
}

.input-filled .input-field:focus {
  background: var(--primary-color-0);
  border-color: var(--secondary-color-0);
}

.input-outlined .input-field {
  background: transparent;
  border: var(--border-width-thin) solid var(--secondary-color-2);
}

.input-outlined .input-field:focus {
  border-color: var(--secondary-color-0);
}

/* Sizes */
.input-sm .input-field {
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  min-height: 2rem;
}

.input-md .input-field {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  min-height: 2.5rem;
}

.input-lg .input-field {
  padding: 1rem 1.25rem;
  font-size: 1rem;
  min-height: 3rem;
}

/* Prefix and Suffix */
.input-prefix,
.input-suffix {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--secondary-color-1);
  flex-shrink: 0;
}

.input-prefix {
  position: absolute;
  left: 0.75rem;
  z-index: 1;
}

.input-suffix {
  position: absolute;
  right: 0.75rem;
  z-index: 1;
}

.input-has-prefix .input-field {
  padding-left: 2.5rem;
}

.input-has-suffix .input-field {
  padding-right: 2.5rem;
}

.prefix-icon,
.suffix-icon {
  font-size: 1.125rem;
}

.clear-button {
  background: none;
  border: none;
  color: var(--secondary-color-1);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-button:hover {
  background: var(--secondary-color-2);
  color: var(--secondary-color-0);
}

.clear-icon {
  font-size: 1rem;
}

/* States */
.input-focused .input-field {
  border-color: var(--secondary-color-0);
  box-shadow: 0 0 0 3px var(--secondary-color-2);
}

.input-error .input-field {
  border-color: var(--emergency-color);
}

.input-error .input-field:focus {
  border-color: var(--emergency-color);
  box-shadow: 0 0 0 3px var(--emergency-color);
  opacity: 0.2;
}

.input-disabled .input-field {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--primary-color-1);
}

.input-readonly .input-field {
  background: var(--primary-color-1);
  cursor: default;
}

/* Messages */
.input-message {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  min-height: 1.25rem;
}

.error-message {
  color: var(--color-error);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.help-text {
  color: var(--secondary-color-1);
  opacity: 0.8;
}

.message-icon {
  font-size: 0.875rem;
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .input-sm .input-field {
    padding: 0.4rem 0.6rem;
    font-size: 0.7rem;
    min-height: 1.75rem;
  }
  
  .input-md .input-field {
    padding: 0.6rem 0.8rem;
    font-size: 0.8rem;
    min-height: 2.25rem;
  }
  
  .input-lg .input-field {
    padding: 0.8rem 1rem;
    font-size: 0.9rem;
    min-height: 2.75rem;
  }
  
  .input-has-prefix .input-field {
    padding-left: 2rem;
  }
  
  .input-has-suffix .input-field {
    padding-right: 2rem;
  }
  
  .input-prefix {
    left: 0.6rem;
  }
  
  .input-suffix {
    right: 0.6rem;
  }
}
</style>
