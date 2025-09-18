import React, { useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: () => void; // 선택적 submit 핸들러
  onCancel?: () => void; // 선택적 cancel 핸들러
}

export const Modal: React.FC<ModalProps> = ({ 
  open, 
  onOpenChange, 
  title, 
  children,
  onSubmit,
  onCancel
}) => {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInputFocused = target.tagName === 'INPUT' || 
                            target.tagName === 'TEXTAREA' || 
                            target.tagName === 'SELECT' ||
                            target.contentEditable === 'true' ||
                            target.hasAttribute('contenteditable');

      // Enter 키: Submit
      if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.altKey) {
        // textarea나 다른 입력 요소에서 줄바꿈을 방해하지 않기 위해 체크
        if (target.tagName === 'TEXTAREA') return;
        
        event.preventDefault();
        if (onSubmit) {
          onSubmit();
        }
      }
      
      // Escape 또는 Backspace 키: Cancel/Close
      if (event.key === 'Escape' || event.key === 'Backspace') {
        // 🎯 입력 필드에 포커스가 있는 경우 모달 닫기 방지
        if (isInputFocused) {
          return; // 입력 필드의 기본 동작 허용
        }
        
        event.preventDefault();
        if (onCancel) {
          onCancel();
        } else {
          onOpenChange(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onSubmit, onCancel, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-xl glass-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {children}
        </div>
        <div className="mt-6 pt-4 border-t border-border/20">
          <div className="flex justify-between text-xs text-muted-foreground/60">
            <span>💡 <kbd className="px-1.5 py-0.5 bg-muted/30 rounded text-xs">Enter</kbd> to submit</span>
            <span><kbd className="px-1.5 py-0.5 bg-muted/30 rounded text-xs">Esc</kbd> to close</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
