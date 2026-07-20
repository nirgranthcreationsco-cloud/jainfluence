import { create } from 'zustand';
import type { ProposalModel, HiringSelectionModel } from '../../data/types';
import { StorageService } from '../../data/services/storage';

interface ProposalState {
  proposals: ProposalModel[];
  hiringSelections: HiringSelectionModel[];
  isLoading: boolean;

  submitProposal: (proposal: Omit<ProposalModel, 'id' | 'createdAt' | 'status'>) => Promise<boolean>;
  fetchProposalsForOpportunity: (opportunityId: string) => Promise<void>;
  fetchMyProposals: (applicantId: string) => Promise<void>;
  acceptProposal: (proposal: ProposalModel, businessId: string) => Promise<void>;
  rejectProposal: (proposalId: string) => Promise<void>;

  fetchHiringSelections: (opportunityId: string) => Promise<void>;
  removeFromHiringList: (selectionId: string) => Promise<void>;
  confirmHiring: (opportunityId: string) => Promise<void>;

  // Computed helpers
  hasApplied: (opportunityId: string, applicantId: string) => boolean;
}

export const useProposalStore = create<ProposalState>((set, get) => ({
  proposals: [],
  hiringSelections: [],
  isLoading: false,

  submitProposal: async (proposal) => {
    set({ isLoading: true });
    try {
      const saved = await StorageService.submitProposal(proposal);
      if (!saved) { set({ isLoading: false }); return false; }

      set(state => ({ proposals: [saved, ...state.proposals], isLoading: false }));

      // Create notification for opportunity owner
      // We store opportunityId in referenceId — the opportunity owner must look this up
      await StorageService.createNotification({
        recipientId: proposal.opportunityId.split('_')[1] ?? proposal.opportunityId, // best-effort
        senderId: proposal.applicantId,
        senderName: proposal.applicantName,
        senderPhoto: proposal.applicantPhoto,
        type: 'proposal_received',
        referenceId: proposal.opportunityId,
        message: `${proposal.applicantName} sent a proposal for ₹${proposal.offerPrice}`,
      });

      return true;
    } catch (e) {
      console.error('submitProposal error:', e);
      set({ isLoading: false });
      return false;
    }
  },

  fetchProposalsForOpportunity: async (opportunityId) => {
    const data = await StorageService.getProposalsForOpportunity(opportunityId);
    set({ proposals: data });
  },

  fetchMyProposals: async (applicantId) => {
    const data = await StorageService.getProposalsByApplicant(applicantId);
    set({ proposals: data });
  },

  acceptProposal: async (proposal, businessId) => {
    await StorageService.updateProposalStatus(proposal.id, 'accepted');
    set(state => ({
      proposals: state.proposals.map(p =>
        p.id === proposal.id ? { ...p, status: 'accepted' } : p
      )
    }));

    // Add to hiring selections
    const selection = await StorageService.saveHiringSelection({
      opportunityId: proposal.opportunityId,
      businessId,
      creatorId: proposal.applicantId,
      creatorName: proposal.applicantName,
      creatorPhoto: proposal.applicantPhoto,
      agreedPrice: proposal.offerPrice,
      status: 'selected',
    });

    if (selection) {
      set(state => ({ hiringSelections: [...state.hiringSelections, selection] }));
    }

    // Notify creator
    await StorageService.createNotification({
      recipientId: proposal.applicantId,
      type: 'proposal_accepted',
      referenceId: proposal.opportunityId,
      message: 'Your proposal has been accepted! You have been added to the hiring list.',
    });
  },

  rejectProposal: async (proposalId) => {
    const proposal = get().proposals.find(p => p.id === proposalId);
    await StorageService.updateProposalStatus(proposalId, 'rejected');
    set(state => ({
      proposals: state.proposals.map(p =>
        p.id === proposalId ? { ...p, status: 'rejected' } : p
      )
    }));

    if (proposal) {
      await StorageService.createNotification({
        recipientId: proposal.applicantId,
        type: 'proposal_rejected',
        referenceId: proposal.opportunityId,
        message: 'Your proposal was not selected for this opportunity. Keep applying!',
      });
    }
  },

  fetchHiringSelections: async (opportunityId) => {
    const data = await StorageService.getHiringSelections(opportunityId);
    set({ hiringSelections: data });
  },

  removeFromHiringList: async (selectionId) => {
    await StorageService.removeHiringSelection(selectionId);
    set(state => ({
      hiringSelections: state.hiringSelections.filter(s => s.id !== selectionId)
    }));
  },

  confirmHiring: async (opportunityId) => {
    await StorageService.confirmHiring(opportunityId);
    set(state => ({
      hiringSelections: state.hiringSelections.map(s =>
        s.opportunityId === opportunityId ? { ...s, status: 'confirmed' } : s
      )
    }));
  },

  hasApplied: (opportunityId, applicantId) => {
    return get().proposals.some(
      p => p.opportunityId === opportunityId && p.applicantId === applicantId
    );
  },
}));
