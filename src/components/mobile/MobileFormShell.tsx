import React from 'react';

type MobileFormShellProps = {
  isEditing: boolean;
  title: string;
  description?: string;
  toolbar?: React.ReactNode;
  form: React.ReactNode;
  secondaryContent?: React.ReactNode;
  className?: string;
};

export function MobileFormShell({ isEditing, title, description, toolbar, form, secondaryContent, className = '' }: MobileFormShellProps) {
  const hasIntro = Boolean(title || description);
  const hasTopContent = hasIntro || Boolean(toolbar);

  return (
    <section className={`flex-1 min-h-0 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl transition-all duration-150 ${isEditing ? 'p-4 sm:p-5' : 'p-5 sm:p-8'} ${className}`.trim()}>
      {!isEditing && hasTopContent ? (
        <div className={`flex flex-col lg:flex-row lg:items-center justify-between ${hasIntro && toolbar ? 'gap-4' : 'gap-0'}`}>
          {hasIntro ? (
            <div>
              {title ? <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">{title}</h3> : null}
              {description ? <p className={`text-xs text-slate-500 dark:text-slate-400 ${title ? 'mt-1' : ''}`}>{description}</p> : null}
            </div>
          ) : null}
          {toolbar ? <div className="w-full lg:w-auto">{toolbar}</div> : null}
        </div>
      ) : null}

      <div className={isEditing || !hasTopContent ? 'mt-0' : 'mt-6'}>{form}</div>

      {!isEditing && secondaryContent ? <div className="mt-6">{secondaryContent}</div> : null}
    </section>
  );
}
