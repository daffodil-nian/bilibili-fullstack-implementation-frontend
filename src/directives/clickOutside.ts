// src/directives/clickOutside.ts
import type { Directive, DirectiveBinding } from 'vue';

// 1. 扩展 HTMLElement 接口，告诉 TypeScript 这个元素上可能有一个 clickOutsideEvent 属性
declare global {
    interface HTMLElement {
        clickOutsideEvent?: (event: MouseEvent) => void;
    }
}

export const vClickOutside: Directive = {
    mounted(el: HTMLElement, binding: DirectiveBinding) {
        // 2. 定义事件处理函数
        el.clickOutsideEvent = (event: MouseEvent) => {
            // 检查点击的目标是否在 el 元素之外
            if (!(el === event.target || el.contains(event.target as Node))) {
                // 如果是外部点击，执行绑定的函数
                if (binding.value && typeof binding.value === 'function') {
                    binding.value(event);
                }
            }
        };

        // 3. 绑定事件到 document
        document.addEventListener('click', el.clickOutsideEvent);
    },
    unmounted(el: HTMLElement) {
        // 4. 组件销毁时移除事件监听，防止内存泄漏
        if (el.clickOutsideEvent) {
            document.removeEventListener('click', el.clickOutsideEvent);
        }
    },
};