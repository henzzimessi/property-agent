export interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentPayload {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
}
