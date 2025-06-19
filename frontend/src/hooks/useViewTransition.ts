"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

// View Transitions APIの型定義
declare global {
  interface Document {
    startViewTransition?: (callback: () => void) => ViewTransition;
  }
  
  interface ViewTransition {
    updateCallbackDone: Promise<void>;
    ready: Promise<void>;
    finished: Promise<void>;
    skipTransition(): void;
  }
}

interface ViewTransitionOptions {
  /**
   * ブラウザがView Transitions APIをサポートしていない場合の動作
   * 'fallback': 通常のナビゲーションにフォールバック
   * 'skip': 何もしない
   */
  fallbackMode?: 'fallback' | 'skip';
  
  /**
   * トランジション前に実行するコールバック
   */
  onBeforeTransition?: () => void;
  
  /**
   * トランジション後に実行するコールバック
   */
  onAfterTransition?: () => void;
  
  /**
   * エラー時のコールバック
   */
  onError?: (error: Error) => void;
}

/**
 * View Transitions APIを使用した画面遷移のカスタムフック
 */
export function useViewTransition() {
  const router = useRouter();

  /**
   * View Transitions APIをサポートしているかチェック
   */
  const isSupported = useCallback((): boolean => {
    return typeof document !== 'undefined' && 'startViewTransition' in document;
  }, []);

  /**
   * View Transitionを使用してページ遷移を実行
   */
  const navigate = useCallback(
    (
      href: string,
      options: ViewTransitionOptions = {}
    ): Promise<void> => {
      const {
        fallbackMode = 'fallback',
        onBeforeTransition,
        onAfterTransition,
        onError,
      } = options;

      return new Promise((resolve, reject) => {
        try {
          console.group(`[ViewTransition] Navigation to: ${href}`);
          console.log(`API supported: ${isSupported()}`);
          console.log(`Document available: ${typeof document !== 'undefined'}`);
          console.log(`startViewTransition available: ${typeof document?.startViewTransition}`);
          
          onBeforeTransition?.();

          // View Transitions APIをサポートしていない場合
          if (!isSupported()) {
            console.log('API not supported, using fallback');
            console.groupEnd();
            if (fallbackMode === 'fallback') {
              router.push(href);
              onAfterTransition?.();
              resolve();
            } else {
              resolve();
            }
            return;
          }

          // View Transitionを開始
          console.log('Starting view transition');
          const transition = document.startViewTransition!(() => {
            console.log('Executing navigation callback');
            // ナビゲーションを少し遅延させてDOMの準備を待つ
            setTimeout(() => {
              router.push(href);
            }, 50);
          });

          console.log('Transition object created:', transition);

          // トランジション完了を待機
          transition.updateCallbackDone
            .then(() => {
              console.log('Update callback done');
              return transition.finished;
            })
            .then(() => {
              console.log('Transition finished');
              console.groupEnd();
              onAfterTransition?.();
              resolve();
            })
            .catch((error) => {
              console.error('Transition failed:', error);
              console.groupEnd();
              const transitionError = new Error(`View transition failed: ${error.message}`);
              onError?.(transitionError);
              // フォールバックとして通常のナビゲーションを実行
              router.push(href);
              resolve();
            });

        } catch (error) {
          console.error('Hook error:', error);
          console.groupEnd();
          const hookError = error instanceof Error 
            ? error 
            : new Error('Unknown error occurred during view transition');
          onError?.(hookError);
          // フォールバックとして通常のナビゲーションを実行
          router.push(href);
          resolve();
        }
      });
    },
    [router, isSupported]
  );

  /**
   * 任意のコールバック関数をView Transitionでラップして実行
   */
  const withTransition = useCallback(
    (
      callback: () => void,
      options: Omit<ViewTransitionOptions, 'onBeforeTransition' | 'onAfterTransition'> = {}
    ): Promise<void> => {
      const { fallbackMode = 'fallback', onError } = options;

      return new Promise((resolve, reject) => {
        try {
          console.group('[ViewTransition] withTransition');
          console.log(`API supported: ${isSupported()}`);
          
          // View Transitions APIをサポートしていない場合
          if (!isSupported()) {
            console.log('API not supported, using fallback');
            console.groupEnd();
            if (fallbackMode === 'fallback') {
              callback();
              resolve();
            } else {
              resolve();
            }
            return;
          }

          // View Transitionを開始
          console.log('Starting withTransition');
          const transition = document.startViewTransition!(callback);
          console.log('Transition object created:', transition);

          // トランジション完了を待機
          transition.finished
            .then(() => {
              console.log('withTransition finished');
              console.groupEnd();
              resolve();
            })
            .catch((error) => {
              console.error('withTransition failed:', error);
              console.groupEnd();
              const transitionError = new Error(`View transition failed: ${error.message}`);
              onError?.(transitionError);
              reject(transitionError);
            });

        } catch (error) {
          console.error('withTransition hook error:', error);
          console.groupEnd();
          const hookError = error instanceof Error 
            ? error 
            : new Error('Unknown error occurred during view transition');
          onError?.(hookError);
          reject(hookError);
        }
      });
    },
    [isSupported]
  );

  return {
    navigate,
    withTransition,
    isSupported,
  };
}