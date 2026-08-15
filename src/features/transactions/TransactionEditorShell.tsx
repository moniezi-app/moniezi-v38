import React from "react";
import { MobileFormShell } from "../../components/mobile/MobileFormShell";

type TransactionEditorShellProps = {
  isKeyboardEditing: boolean;
  mode: 'add' | 'edit';
  activeTab: 'income' | 'expense' | 'billing';
  billingDocType: 'invoice' | 'estimate';
  tabSelector?: React.ReactNode;
  utilityPanel?: React.ReactNode;
  formContent: React.ReactNode;
  descriptionOverride?: string;
};

export function TransactionEditorShell({ isKeyboardEditing, mode, activeTab, billingDocType, tabSelector, utilityPanel, formContent, descriptionOverride }: TransactionEditorShellProps) {
  return (
    <MobileFormShell
      isEditing={isKeyboardEditing}
      title=""
      description={descriptionOverride}
      toolbar={!isKeyboardEditing ? tabSelector : undefined}
      form={
        <div className="space-y-6">
          {utilityPanel && !isKeyboardEditing ? utilityPanel : null}
          {formContent}
        </div>
      }
      className="border-0 shadow-none bg-transparent dark:bg-transparent p-0 sm:p-0"
    />
  );
}
