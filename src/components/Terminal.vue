<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useTerminal } from '@/core/terminal/useTerminal';

const terminal = useTerminal()
const wrapper = ref<HTMLElement>()
const term = ref<HTMLInputElement>();
const rerender = ref(0)

onMounted(async () => {
  terminal.execute('help')
  rerender.value++
})

const handleKeyDown = (evt: KeyboardEvent) => {
  evt.stopImmediatePropagation();
    
  const key = evt.key;
  if (key === "Tab") {
    if (terminal.applySuggestion()) {
      evt.preventDefault();
    }
    terminal.computeSuggestions()
  } else if (key === "ArrowUp" || key === "ArrowDown") {
    evt.preventDefault();
  }
};

const handleKeyUp = (evt: KeyboardEvent) => {
  evt.stopImmediatePropagation();
  
  const key = evt.key;
  if (key === "Enter") {
    terminal.execute()
    queueMicrotask(() => {
      wrapper.value?.scroll({
        top: wrapper.value?.scrollHeight,
      })
    });
    terminal.computeSuggestions()
  } else if (key === "ArrowUp") {
    evt.preventDefault();
    if (terminal.suggestions.length > 0) {
      terminal.previousSuggestion()
    } else {
      terminal.applyPreviousHistoryEntry()
    }
  } else if (key === "ArrowDown") {
    evt.preventDefault();
    if (terminal.suggestions.length > 0) {
      terminal.nextSuggestion()
    }else {
      terminal.applyNextHistoryEntry()
    }
  } else if (key === "Tab") {
    // ignore
  } else if (key === "Escape") {
    terminal.hideSuggestions()
  } else {
    // normal char
    terminal.computeSuggestions()
  }
};

const handleTerminalClick = () => {
  term.value?.focus();
}

</script>

<template>
  <div id="terminal" :ref="r => wrapper = (r as HTMLElement)" @click="handleTerminalClick">
    <div class="terminal__spacer"></div>
    <p class="terminal__output" v-if="rerender">
      <span style="display: block" v-for="line in terminal.stdOut">{{ line }}</span>
    </p>
    <div class="terminal__input-line">
      <span>$&nbsp;</span>
      <input type="text" v-model="terminal.rawInput" class="terminal__input" :ref="r => term = (r as HTMLInputElement)" @keydown="handleKeyDown" @keyup="handleKeyUp" />
      <div class="suggestions" v-if="terminal.suggestions.length > 0">
        <ul class="suggestions-list">
          <li class="suggestions__item" v-for="suggestion in terminal.suggestions" :key="suggestion.value"
          :class="{active: suggestion === terminal.activeSuggestion}">
            <span class="suggestions__title">{{ suggestion.value }}</span>
            <span class="suggestions__description">{{ suggestion.description }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>


<style scoped>
#terminal {
  height: 300px;
  overflow-y: scroll;
  padding: 0.25rem;
  display: flex;
  flex-direction: column;
}

.terminal__spacer {
  height: 100%;
  flex-grow: 1;
}

.terminal__output {
  margin: 0;
  word-break: break-all;
  font-family: monospace;
  font-size: 1rem;
}

.terminal__input {
  background: none;
  border: none;
  width: 100%;
  cursor: crosshair;
  display: block;
  position: relative;
  color: var(--color-text);
  outline: none;
  font-family: monospace;
  font-size: 1rem;
  padding: 0;
}

.terminal__input-line {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-family: monospace;
  font-size: 1rem;
  position: relative;
}

.suggestions {
  position: absolute;
  left: 1.7rem;
  top: 0;
  translate: 0 -100%;
  max-width: 70%;
  overflow: auto;
  background-color: var(--color-surface);
  border: 1px solid var(--color-text);
  border-radius: 3px;
  z-index: 1000;
}

.suggestions-list {
  margin: 0;
  padding: 0;
}

.suggestions__item {
  padding: 0.25rem 0.5rem;
}

.suggestions__title {
  font-weight: 600;
  line-height: 1.1rem;
  margin-right: 0.5rem;
}

.suggestions__item.active .suggestions__title {
  color: var(--color-primary);
}

.suggestions__item.active {
  background-color: var(--color-bg);
}
</style>
