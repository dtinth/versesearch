let currentTarget: HTMLElement | undefined;

let accumulator = 0;

export function scrollInto(target: HTMLElement) {
  if (!currentTarget) {
    requestAnimationFrame(scrollToTarget);
  }
  currentTarget = target;
}

export function clearTarget(target: HTMLElement) {
  if (currentTarget === target) {
    currentTarget = undefined;
  }
}

function scrollYBy(delta: number) {
  accumulator += delta;
  const rounded = Math.round(accumulator);
  if (rounded !== 0) {
    accumulator -= rounded;
    window.scrollBy(0, rounded);
  }
}

function scrollToTarget() {
  if (!currentTarget) {
    return;
  }
  if (!currentTarget.isConnected) {
    currentTarget = undefined;
    return;
  }
  const centerY = window.innerHeight / 2;
  const targetRect = currentTarget.getBoundingClientRect();
  const targetY = targetRect.y + targetRect.height / 2;
  const effectY = (targetY - centerY) / 5;
  if (Math.abs(effectY) <= 1) {
    currentTarget = undefined;
  } else {
    scrollYBy(effectY);
  }
  if (currentTarget) {
    requestAnimationFrame(scrollToTarget);
  }
}
