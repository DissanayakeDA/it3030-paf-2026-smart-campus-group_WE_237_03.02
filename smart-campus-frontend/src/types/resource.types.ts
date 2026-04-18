export type ResourceType = 'LECTURE_HALL' | 'LAB' | 'MEETING_ROOM' | 'EQUIPMENT';

export type ResourceStatus = 'ACTIVE' | 'OUT_OF_SERVICE';

export type ResourceCondition =
  | 'EXCELLENT'
  | 'GOOD'
  | 'NEEDS_ATTENTION'
  | 'UNDER_MAINTENANCE';

export interface ResourceResponse {
  id: number;
  name: string;
  description: string | null;
  type: ResourceType;
  capacity: number;
  location: string;
  availableFrom: string;
  availableTo: string;
  status: ResourceStatus;
  condition: ResourceCondition;
  lastInspectedAt: string | null;
  inspectionNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ResourceListFilters = {
  type?: ResourceType;
  minCapacity?: number;
  location?: string;
  status?: ResourceStatus;
};
