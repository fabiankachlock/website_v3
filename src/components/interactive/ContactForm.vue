<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useTranslation } from 'i18next-vue';
import { isEmail, isNonEmptyString } from '@/scripts/vue/validator';
import { watchTheme } from '@/scripts/vue/watch-theme';
import VueHcaptcha from '@hcaptcha/vue3-hcaptcha';
import CheckmarkOutline from '@carbon/icons-vue/es/checkmark--outline/32';
import Warning from '@carbon/icons-vue/es/warning/32';
import WarningAlt from '@carbon/icons-vue/es/warning--alt/32';
import { onUnmounted } from 'vue';

const { t, i18next } = useTranslation();

const captchaKey = import.meta.env.DEV
  ? '10000000-ffff-ffff-ffff-000000000001'
  : '033aad19-267b-4f23-b6b0-ae5f86a84b62';
const isHttps = ref(true);
const saveUrl = ref('');
const captchaRef = ref<VueHcaptcha | undefined>(undefined);
const name = ref('');
const email = ref('');
const message = ref('');
const captchaToken = ref('');
const _h_name = ref('');
const _h_subject = ref('');
const error = ref<string | undefined>(undefined);
const isLoading = ref(false);
const isDone = ref(false);
const theme = ref('');
const forceReload = ref(1);
let unwatchTheme = () => {};

watch([name, email, message, captchaToken], () => {
  error.value = undefined;
});

onMounted(() => {
  isHttps.value = window.location.protocol.startsWith('https') || import.meta.env.DEV;
  saveUrl.value = window.location.href.replace('http://', 'https://');
  unwatchTheme = watchTheme(newTheme => {
    // hcaptcha sadly cant change theme reactively...
    theme.value = newTheme;
    forceReload.value += 1;
  });
});

onUnmounted(() => {
  unwatchTheme();
});

const handleCaptchaError = (err: unknown) => {
  error.value = 'captchaError';
  console.error(err);
};

const handleCaptchaExpire = () => {
  error.value = 'captchaExpired';
};

const handleCaptchaVerify = async (token: string) => {
  captchaToken.value = token;
};

const handleSubmit = async () => {
  error.value = undefined;
  if (!isNonEmptyString(name.value)) {
    error.value = 'invalidName';
    return;
  }

  if (!isEmail(email.value)) {
    error.value = 'invalidEmail';
    return;
  }

  if (!isNonEmptyString(message.value)) {
    error.value = 'invalidMessage';
    return;
  }

  if (!captchaToken.value) {
    error.value = 'captchaMissing';
    return;
  }

  if (_h_name.value || _h_subject.value) {
    isDone.value = true;
    return;
  }

  isLoading.value = true;
  try {
    const response = await fetch('https://api.fabiankachlock.dev/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        message: message.value,
        captchaToken: captchaToken.value,
        site: window.location.href,
      }),
    });
    if (response.status === 401) {
      error.value = 'captchaInsufficient';
      if (captchaRef.value) {
        captchaRef.value.reset();
      }
    } else if (response.status < 200 || response.status >= 300) {
      error.value = 'nonSuccessResponse';
    } else {
      await new Promise(res => {
        setTimeout(() => res({}), 2000);
      });
      isDone.value = true;
    }
    isLoading.value = false;
  } catch {
    isLoading.value = false;
    error.value = 'cantSubmit';
  }
};
</script>

<template>
  <div v-if="!isHttps" class="alert alert--warn">
    <Warning class="icon icon--warn" />
    <p>
      <span style="display: block">
        {{ t('contactForm.warnHttp') }}
      </span>
      <a :href="saveUrl" style="display: inline-block; margin-top: 0.5rem; font-size: 1.2rem; font-weight: bold">
        {{ t('contactForm.httpsLink') }}
      </a>
    </p>
  </div>
  <div v-else-if="isDone" class="alert alert--success">
    <CheckmarkOutline class="icon icon--success" />
    <p>
      {{ t('contactForm.submitDone') }}
    </p>
  </div>
  <form v-else id="contact-form" class="form" @submit.prevent="handleSubmit">
    <div>
      <label for="next-name"> Subject </label>
      <input type="text" name="next_name" placeholder="My Other Name" id="next-name" tabindex="-1" v-model="_h_name" />
    </div>

    <div class="form__row">
      <label for="name">
        {{ t('contactForm.name') }}
      </label>
      <input
        type="text"
        :name="t('contactForm.name')"
        :placeholder="t('contactForm.namePlaceholder')"
        id="name"
        v-model="name"
      />
    </div>

    <div class="form__row">
      <label for="email">
        {{ t('contactForm.email') }}
      </label>
      <input
        type="text"
        :name="t('contactForm.email')"
        :placeholder="t('contactForm.emailPlaceholder')"
        id="email"
        v-model="email"
      />
    </div>

    <div>
      <label for="subject"> Subject </label>
      <input
        type="text"
        name="message_subject"
        placeholder="My Message"
        id="subject"
        tabindex="-1"
        v-model="_h_subject"
      />
    </div>

    <div class="form__row">
      <label for="message">
        {{ t('contactForm.message') }}
      </label>
      <textarea
        :name="t('contactForm.message')"
        :placeholder="t('contactForm.messagePlaceholder')"
        id="message"
        v-model="message"
      ></textarea>
    </div>

    <div class="form__row form__row--captcha" v-if="captchaKey">
      <VueHcaptcha
        :key="forceReload"
        :sitekey="captchaKey"
        :language="i18next.language"
        :theme="theme"
        @error="handleCaptchaError"
        @verify="handleCaptchaVerify"
        @expired="handleCaptchaExpire"
        :ref="captchaRef"
      />
    </div>

    <div class="form__row--error">
      <div class="alert alert--error" v-if="error">
        <WarningAlt class="icon icon--error" />
        <p>{{ t(`contactForm.error.${error}`) }}</p>
      </div>
    </div>

    <div class="form__row">
      <button type="submit" v-if="!isLoading">
        {{ t('contactForm.submit') }}
      </button>
      <div v-else class="submit-loader">
        <p>
          {{ t('contactForm.loading') }}
        </p>
      </div>
    </div>
  </form>
</template>

<style scoped>
.form {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: var(--color-surface);
  padding: 2rem;
  border-radius: 5px;
  border: 1px solid var(--color-text);
}

.form__row {
  display: flex;
  flex-direction: column;
  margin: 0.5rem 0;
  font-family: 'Mona Sans';
}

.form__row textarea,
.form__row input {
  font-size: 1rem;
  color: var(--color-text);
  font-family: 'Mona Sans';
  background-color: var(--color-bg-tint-3);
  border: 1px solid var(--color-bg);
  padding: 0.2rem;
  resize: vertical;
  box-shadow: 12px 10px 1px -4px var(--color-primary);
  transition: box-shadow 70ms linear;
}

.form__row textarea:hover,
.form__row input:hover {
  border-color: var(--color-primary);
  box-shadow: 12px 10px 0 -4px var(--color-primary);
}

.form__row label {
  font-family: 'Source Code Pro';
  color: var(--color-text-header);
  font-size: 1.1rem;
  font-weight: 400;
  margin-bottom: 0.5rem;
}

.form__row button[type='submit'],
.form__row .submit-loader {
  font-size: 1.1rem;
  font-family: 'Mona Sans';
  font-weight: 500;
  cursor: pointer;
  background: none;
  color: var(--color-text);
  border: 2px solid var(--color-text);
  background-color: var(--color-bg);
  padding: 0.4rem 0.9rem;
  transition:
    box-shadow 70ms linear,
    translate 70ms linear;
  box-shadow:
    0px 0px 0 -1px var(--color-surface),
    0px 0px var(--color-text);
  user-select: none;
}

.form__row button[type='submit']:hover {
  translate: -5px -5px;
  background-color: var(--color-primary);
  color: var(--color-primary-text);
  box-shadow:
    5px 5px 0 -2px var(--color-surface),
    5px 5px var(--color-text);
}

.form__row--captcha {
  align-items: center;
}

#subject,
label[for='subject'] {
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
  height: 0;
  width: 0;
  z-index: -1;
}

#next-name,
#next-name::placeholder,
label[for='next-name'] {
  position: absolute;
  top: -2rem;
  background: transparent;
  color: transparent;
  border-color: transparent;
  pointer-events: none;
  user-select: none;
}

.alert {
  display: flex;
  padding: 0.25rem;
  color: var(--color-text);
}

.alert p {
  align-self: center;
  font-family: 'Mona Sans';
}

.alert--warn {
  margin-bottom: 1rem;
  border: 2px solid yellow;
  background: rgba(255, 255, 0, 0.4);
}

[data-theme='dark'] .alert--warn {
  background: rgba(255, 255, 0, 0.2);
}

.alert--error {
  margin-top: 1rem;
  border: 2px solid red;
  background: rgba(255, 0, 0, 0.4);
}

[data-theme='dark'] .alert--error {
  background: rgba(255, 0, 0, 0.3);
}

.alert--success {
  border: 2px solid green;
  background: rgba(0, 128, 0, 0.4);
}

[data-theme='dark'] .alert--success {
  background: rgba(0, 128, 0, 0.3);
}

.alert .icon {
  flex-shrink: 0;
  height: 1.7rem;
  width: 1.7rem;
  margin-right: 0.5rem;
  fill: var(--color-text);
}

.alert a {
  font-family: 'Mona Sans';
  font-style: italic;
}

.form__row .submit-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 0.2rem 1rem;
}
</style>
