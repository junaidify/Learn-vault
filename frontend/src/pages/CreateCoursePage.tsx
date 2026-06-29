import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { courseSchema, type CourseFormValues } from '../lib/validations';
import { useCreateCourse } from '../api/courses';
import { useAuth } from '../context/AuthContext';
import VideoUpload from '../components/ui/VideoUpload';

type Step = 1 | 2 | 3;

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createMutation = useCreateCourse();
  const [step, setStep] = useState<Step>(1);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: { name: '', description: '', amount: 0, category: 'TECH', published: false },
  });

  const values = watch();

  const goToStep2 = async () => {
    const valid = await trigger(['name', 'description', 'amount', 'category']);
    if (valid) setStep(2);
  };

  const goToStep3 = () => {
    if (!videoFile) return;
    setStep(3);
  };

  const onSubmit = (formValues: CourseFormValues) => {
    if (!videoFile || !user) return;

    createMutation.mutate(
      {
        data: {
          ...formValues,
          author: user.name,
          videoUrl: '', // Server sets this after S3 upload — see flagged gap
        },
        video: videoFile,
        onProgress: setUploadProgress,
      },
      {
        onSuccess: () => navigate('/author/courses'),
      },
    );
  };

  return (
    <div className="animate-fade-in mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-surface-900)' }}>
          Create New Course
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-surface-800)', opacity: 0.6 }}>
          Fill in the details below to publish your course
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-0">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all"
                   style={
                     step >= s
                       ? { background: 'var(--color-brand-600)', color: 'white' }
                       : { background: 'var(--color-surface-200)', color: 'var(--color-surface-800)' }
                   }>
                {s}
              </div>
              <span className="mt-1.5 text-xs font-medium"
                    style={{ color: step >= s ? 'var(--color-brand-600)' : 'var(--color-surface-800)', opacity: step >= s ? 1 : 0.4 }}>
                {s === 1 ? 'Details' : s === 2 ? 'Video' : 'Review'}
              </span>
            </div>
            {s < 3 && (
              <div className="mx-2 mb-5 h-0.5 flex-1 transition-all"
                   style={{ background: step > s ? 'var(--color-brand-600)' : 'var(--color-surface-200)' }} />
            )}
          </div>
        ))}
      </div>

      {/* Form card */}
      <div className="rounded-2xl p-6 sm:p-8"
           style={{ background: 'var(--color-surface-0)', boxShadow: 'var(--shadow-card)' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* STEP 1 — Course Details */}
          {step === 1 && (
            <div className="animate-fade-in space-y-5">
              <Field label="Course Name" id="name" error={errors.name?.message}>
                <input id="name" type="text" {...register('name')}
                       className={inputCls(!!errors.name)} placeholder="e.g. Full-Stack Web Development" />
              </Field>

              <Field label="Description" id="description" error={errors.description?.message}>
                <textarea id="description" rows={4} {...register('description')}
                          className={inputCls(!!errors.description) + ' resize-none'}
                          placeholder="Describe what students will learn..." />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Price (₹)" id="amount" error={errors.amount?.message}>
                  <input id="amount" type="number" {...register('amount', { valueAsNumber: true })}
                         className={inputCls(!!errors.amount)} placeholder="999" />
                </Field>

                <Field label="Category" id="category" error={errors.category?.message}>
                  <select id="category" {...register('category')}
                          className={inputCls(!!errors.category) + ' cursor-pointer'}>
                    <option value="TECH">Tech</option>
                    <option value="COMMUNICATION">Communication</option>
                    <option value="PSYCHOLOGY">Psychology</option>
                    <option value="LANGUAGE">Language</option>
                  </select>
                </Field>
              </div>

              <div className="flex items-center gap-3">
                <input id="published" type="checkbox" {...register('published')}
                       className="h-4 w-4 accent-indigo-600" />
                <label htmlFor="published" className="text-sm font-medium cursor-pointer"
                       style={{ color: 'var(--color-surface-800)' }}>
                  Publish immediately
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <button type="button" onClick={goToStep2}
                        className="cursor-pointer rounded-xl border-none px-6 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-md"
                        style={{ background: 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-500))' }}>
                  Next: Upload Video →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 — Video Upload */}
          {step === 2 && (
            <div className="animate-fade-in space-y-6">
              <VideoUpload onFile={setVideoFile} />

              <div className="flex items-center justify-between pt-2">
                <button type="button" onClick={() => setStep(1)}
                        className="cursor-pointer rounded-xl border-none px-4 py-2.5 text-sm font-medium"
                        style={{ background: 'var(--color-surface-100)', color: 'var(--color-surface-800)' }}>
                  ← Back
                </button>
                <button type="button" onClick={goToStep3} disabled={!videoFile}
                        className="cursor-pointer rounded-xl border-none px-6 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-500))' }}>
                  Next: Review →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — Review */}
          {step === 3 && (
            <div className="animate-fade-in space-y-5">
              <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-surface-900)' }}>
                Review your course
              </h3>

              <div className="space-y-3 rounded-xl p-4" style={{ background: 'var(--color-surface-50)' }}>
                <ReviewRow label="Name" value={values.name} />
                <ReviewRow label="Description" value={values.description} />
                <ReviewRow label="Price" value={`₹${values.amount.toLocaleString('en-IN')}`} />
                <ReviewRow label="Category" value={values.category} />
                <ReviewRow label="Published" value={values.published ? 'Yes' : 'No'} />
                <ReviewRow label="Video" value={videoFile?.name ?? '—'} />
                <ReviewRow label="Author" value={user?.name ?? '—'} />
              </div>

              {/* Upload progress */}
              {createMutation.isPending && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium"
                       style={{ color: 'var(--color-surface-800)' }}>
                    <span>Uploading…</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full"
                       style={{ background: 'var(--color-surface-200)' }}>
                    <div className="h-full rounded-full transition-all duration-300"
                         style={{
                           width: `${uploadProgress}%`,
                           background: 'linear-gradient(90deg, var(--color-brand-600), var(--color-brand-400))',
                         }} />
                  </div>
                </div>
              )}

              {createMutation.isError && (
                <div className="rounded-lg p-3 text-sm font-medium"
                     style={{ background: '#FEF2F2', color: 'var(--color-error)' }}>
                  Failed to create course. Please try again.
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button type="button" onClick={() => setStep(2)}
                        disabled={createMutation.isPending}
                        className="cursor-pointer rounded-xl border-none px-4 py-2.5 text-sm font-medium disabled:opacity-60"
                        style={{ background: 'var(--color-surface-100)', color: 'var(--color-surface-800)' }}>
                  ← Back
                </button>
                <button type="submit" disabled={createMutation.isPending}
                        className="cursor-pointer rounded-xl border-none px-6 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-500))' }}>
                  {createMutation.isPending ? 'Creating…' : 'Create Course'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

/* ---- helpers ---- */

function inputCls(hasError: boolean): string {
  return `w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 ${
    hasError ? 'border-red-400' : ''
  }`;
}

function Field({ label, id, error, children }: {
  label: string; id: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--color-surface-800)' }}>
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs" style={{ color: 'var(--color-error)' }}>{error}</p>}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs font-medium shrink-0" style={{ color: 'var(--color-surface-800)', opacity: 0.5 }}>
        {label}
      </span>
      <span className="text-sm font-medium text-right" style={{ color: 'var(--color-surface-900)' }}>
        {value}
      </span>
    </div>
  );
}
