import actionCreatorFactory from 'typescript-fsa';
import { AppActions } from '../constants';

export interface Loading {
  cachedMeeting: boolean;
  meetingDeployment: boolean;
  rsvpConfirmation: boolean;
  rsvpCancellationConfirmation: boolean;
  startMeetingConfirmation: boolean;
  endMeetingConfirmation: boolean;
  cancelMeetingConfirmation: boolean;

  markAttendanceConfirmation: boolean;
}

const actionCreator = actionCreatorFactory();

export const UpdateCachedMeetingLoading = actionCreator<boolean>(AppActions.UPDATE_CACHED_MEETING_LOADING);
export const UpdateMeetingDeploymentLoading = actionCreator<boolean>(AppActions.UPDATE_MEETING_DEPLOYMENT_LOADING);
export const UpdateRsvpConfirmationLoading = actionCreator<boolean>(AppActions.UPDATE_RSVP_CONFIRMATION_LOADING);
export const UpdateRsvpCancellationConfirmationLoading = actionCreator<boolean>(AppActions.UPDATE_RSVP_CANCELLATION_CONFIRMATION_LOADING);
export const UpdateStartMeetingConfirmationLoading = actionCreator<boolean>(AppActions.UPDATE_START_MEETING_CONFIRMATION_LOADING);
export const UpdateEndMeetingConfirmationLoading = actionCreator<boolean>(AppActions.UPDATE_END_MEETING_CONFIRMATION_LOADING);
export const UpdateCancelMeetingConfirmationLoading = actionCreator<boolean>(AppActions.UPDATE_CANCEL_MEETING_CONFIRMATION_LOADING);
export const UpdateMarkAttendanceConfirmationLoading = actionCreator<boolean>(AppActions.UPDATE_MARK_ATTENDANCE_CONFIRMATION_LOADING);


export const actions = {
  UpdateCachedMeetingLoading,
  UpdateMeetingDeploymentLoading,
  UpdateRsvpConfirmationLoading,
  UpdateRsvpCancellationConfirmationLoading,
  UpdateStartMeetingConfirmationLoading,
  UpdateEndMeetingConfirmationLoading,
  UpdateCancelMeetingConfirmationLoading,
  UpdateMarkAttendanceConfirmationLoading
};
