export const StatusEnum = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export type StatusEnum = (typeof StatusEnum)[keyof typeof StatusEnum];

export const DEFAULT_STATUS = StatusEnum.ACTIVE;
