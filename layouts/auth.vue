<template>
  <div class="shell">
    <ThemeToggle class="floating" />
    <main class="shell-main">
      <slot />
    </main>
    <AppFooter />
    <HowToPlayModal />
  </div>
</template>
