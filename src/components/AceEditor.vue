<template>
  <div ref="editorContainer" class="ace-editor-container"></div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, nextTick } from 'vue'
import ace from 'ace-builds'
import 'ace-builds/src-noconflict/mode-java'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/theme-monokai'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  mode: {
    type: String,
    default: 'java'
  },
  theme: {
    type: String,
    default: 'monokai'
  },
  height: {
    type: String,
    default: '400px'
  },
  fontSize: {
    type: Number,
    default: 14
  }
})

const emit = defineEmits(['update:modelValue'])

const editorContainer = ref(null)
let editor = null

const updateEditorValue = (value) => {
  if (editor) {
    const currentValue = editor.getValue()
    if (currentValue !== value) {
      editor.setValue(value || '', -1)
    }
  }
}

onMounted(() => {
  nextTick(() => {
    if (!editorContainer.value) return
    
    editor = ace.edit(editorContainer.value)
    editor.setTheme(`ace/theme/${props.theme}`)
    editor.getSession().setMode(`ace/mode/${props.mode}`)
    
    editor.setOptions({
      fontSize: props.fontSize,
      showPrintMargin: true,
      showGutter: true,
      highlightActiveLine: true,
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true,
      enableSnippets: true,
      showLineNumbers: true,
      tabSize: 2,
      maxLines: Infinity,
      minLines: 20
    })
    
    editor.on('change', () => {
      emit('update:modelValue', editor.getValue())
    })
    
    editorContainer.value.style.height = props.height
    
    updateEditorValue(props.modelValue)
  })
})

watch(() => props.modelValue, (newValue) => {
  updateEditorValue(newValue)
}, { immediate: true, deep: true })

watch(() => props.height, (newHeight) => {
  if (editorContainer.value) {
    editorContainer.value.style.height = newHeight
  }
})

onUnmounted(() => {
  if (editor) {
    editor.destroy()
    editor = null
  }
})
</script>

<style scoped>
.ace-editor-container {
  width: 100%;
  min-height: 400px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}
</style>