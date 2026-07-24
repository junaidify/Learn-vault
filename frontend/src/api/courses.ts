import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './axios';
import type {
  CourseResponseDto,
  PageResponse,
  CourseQueryParams,
  CourseFormData,
} from '../lib/types';

/* =========================================
   Courses API hooks
   ========================================= */

/** GET /api/v1/courses — paginated list */
export function useCourses(params: CourseQueryParams = {}) {
  const { page = 0, size = 10, sortBy = 'createdAt', direction = 'DESC' } = params;

  return useQuery<PageResponse<CourseResponseDto>>({
    queryKey: ['courses', { page, size, sortBy, direction }],
    queryFn: async () => {
      const res = await api.get<PageResponse<CourseResponseDto>>('/api/v1/courses', {
        params: { page, size, sortBy, direction },
      });
      return res.data;
    },
  });
}

/** GET /api/v1/courses/enrolled — user's enrolled courses */
export function useEnrolledCourses() {
  return useQuery<CourseResponseDto[]>({
    queryKey: ['courses', 'enrolled'],
    queryFn: async () => {
      const res = await api.get<CourseResponseDto[]>('/api/v1/courses/enrolled');
      return res.data;
    },
  });
}

/** GET /api/v1/courses/author — author's courses */
export function useAuthorCourses() {
  return useQuery<CourseResponseDto[]>({
    queryKey: ['courses', 'author'],
    queryFn: async () => {
      const res = await api.get<CourseResponseDto[]>('/api/v1/courses/author');
      return res.data;
    },
  });
}

/** GET /api/v1/courses/:id — single course */
export function useCourse(id: number | string) {
  return useQuery<CourseResponseDto>({
    queryKey: ['course', id],
    queryFn: async () => {
      const res = await api.get<CourseResponseDto>(`/api/v1/courses/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

/** POST /api/v1/courses/create-course — via S3 presigned URL for fast direct upload */
export function useCreateCourse() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      video,
      onProgress,
      onStageChange,
    }: {
      data: CourseFormData;
      video: File;
      onProgress?: (pct: number) => void;
      onStageChange?: (stage: string) => void;
    }) => {
      // 1. Get presigned upload URL from Spring Boot backend
      onStageChange?.('Authorizing secure S3 upload...');
      const urlRes = await api.get<{ uploadUrl: string; key: string }>('/api/v1/courses/upload-url', {
        params: { fileName: video.name, contentType: video.type || 'video/mp4' },
      });
      const { uploadUrl, key } = urlRes.data;

      // 2. Stream video file directly to AWS S3 bucket
      onStageChange?.('Uploading video directly to S3 cloud...');
      await axios.put(uploadUrl, video, {
        headers: {
          'Content-Type': video.type || 'video/mp4',
        },
        onUploadProgress: (e) => {
          if (e.total && onProgress) {
            onProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
      });

      // 3. Finalize course creation in backend DB
      onStageChange?.('Finalizing course creation & saving...');
      const res = await api.post('/api/v1/courses/create-course-json', {
        ...data,
        videoUrl: key,
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

/** PATCH /api/v1/courses/:id — multipart/form-data, video optional */
export function useUpdateCourse() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
      video,
      onProgress,
    }: {
      id: number | string;
      data: CourseFormData;
      video?: File | null;
      onProgress?: (pct: number) => void;
    }) => {
      const formData = new FormData();
      formData.append(
        'data',
        new Blob([JSON.stringify(data)], { type: 'application/json' }),
      );
      if (video) {
        formData.append('video', video);
      }

      const res = await api.patch(`/api/v1/courses/${id}`, formData, {
        onUploadProgress: (e) => {
          if (e.total && onProgress) {
            onProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
      });
      return res.data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['courses'] });
      qc.invalidateQueries({ queryKey: ['course', vars.id] });
    },
  });
}

/** DELETE /api/v1/courses/:id */
export function useDeleteCourse() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete<string>(`/api/v1/courses/${id}`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}
