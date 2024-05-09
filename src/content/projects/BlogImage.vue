<script setup lang="ts">
import MaximizeIcon from '@carbon/icons-vue/es/maximize/32';
import MinimizeIcon from '@carbon/icons-vue/es/minimize/32';

type ImageProps = {
  src: string;
  width: number;
  height: number;
  format: string;
};

defineProps<{
  dark: ImageProps;
  light: ImageProps;
  alt?: string;
  color?: 'text' | 'background' | 'primary' | 'secondary';
}>();
</script>

<template>
  <div class="blog-image">
    <div class="blog-image__backdrop"></div>
    <div class="blog-image__wrapper">
      <image
        class="blog-image__image blog-image__image--dark"
        :src="dark.src"
        :width="dark.width"
        :height="dark.height"
        :alt="alt"
        loading="lazy"
        decoding="async"
      />
      <image
        class="blog-image__image blog-image__image--light"
        :src="light.src"
        :width="light.width"
        :height="light.height"
        :alt="alt"
        loading="lazy"
        decoding="async"
      />
      <MaximizeIcon
        role="button"
        tabindex="0"
        class="blog-image__action blog-image__action--maximize"
        :class="{
          ['blog-image__action--' + (color ?? 'primary')]: true,
        }"
      />
      <MinimizeIcon
        role="button"
        tabindex="0"
        class="blog-image__action blog-image__action--minimize"
        :class="{
          ['blog-image__action--' + (color ?? 'primary')]: true,
        }"
      />
    </div>
    <p class="blog-image__alt">
      {{ alt }}
    </p>
  </div>
</template>

<style scoped lang="css">
.blog-image {
  width: 100%;
  position: relative;
}

.blog-image__alt {
  text-align: center;
  color: var(--color-text-secondary);
  max-width: 100% !important;
}

.blog-image__wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: scale 140ms ease-in-out;
  max-width: 1024px;
  max-height: calc(100vh - 4rem);
}

.blog-image__image {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  margin: auto;
}

.blog-image:active .blog-image__wrapper {
  scale: 1.05;
}

.blog-image--open {
  position: fixed;
  inset: 0;
  padding: 1rem;
  display: grid;
  place-items: center;
  width: calc(100% - 2rem);
  z-index: 100;
}

.blog-image--open:active .blog-image__wrapper {
  scale: 0.95;
}

.blog-image--open .blog-image__wrapper {
  border-radius: 5px;
  margin-bottom: 2rem;
  height: 100%;
  display: flex;
}

.blog-image--open .blog-image__backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
  cursor: pointer;
}

.blog-image--open .blog-image__alt {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0 2rem;
  font-size: 1.2rem;
  color: var(--color-text);
}

.blog-image__action {
  position: absolute;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0.5rem;
  margin: 0.5rem;
  transition:
    right 140ms ease-in-out,
    top 140ms ease-in-out,
    scale 70ms ease-in-out;

  right: -3rem;
  top: -3rem;
}

.blog-image__action[aria-hidden='true'] {
  display: none;
}

.blog-image__action:focus,
.blog-image__wrapper:hover .blog-image__action {
  right: 0rem;
  top: 0rem;
}

@media (pointer: coarse) {
  .blog-image__action {
    right: 0rem;
    top: 0rem;
  }
}

.blog-image__action--minimize {
  display: none !important;
}

.blog-image__action:focus {
  transition: none;
}

.blog-image__action:hover {
  scale: 1.1;
}

.blog-image__action:active {
  scale: 0.95;
}

.blog-image__action--text {
  fill: var(--color-text);
}

.blog-image__action--background {
  fill: var(--color-bg);
}

.blog-image__action--primary {
  fill: var(--color-primary);
}

.blog-image__action--secondary {
  fill: var(--color-secondary);
}

[data-theme='dark'] .blog-image .blog-image__image--dark {
  display: block;
}

[data-theme='dark'] .blog-image .blog-image__image--light {
  display: none;
}

[data-theme='light'] .blog-image .blog-image__image--dark {
  display: none;
}

[data-theme='light'] .blog-image .blog-image__image--light {
  display: block;
}
</style>
