export interface CreateCheckInRequest {
  trailId: string;
  completedDate: string;
  notes?: string;
  photoUrl?: string;
}

export interface UpdateCheckInRequest {
  completedDate: string;
  notes?: string;
  photoUrl?: string;
}

export interface CheckInResponse {
  id: string;
  userId: string;
  trailId: string;
  completedDate: string;
  notes?: string | null;
  photoUrl?: string | null;
  isHidden: boolean;
}
