/**
 * Typed Database schema for AZ Off Script — The Off Script Room.
 * Mirrors supabase/schema.sql exactly. Used by Supabase clients for type-safe queries.
 */

export type UserRole = "admin" | "member";

export type ClipStatus =
  | "Dropped" | "Needs Info" | "Planned" | "Shot" | "Cutting"
  | "Review" | "Ready" | "Scheduled" | "Live" | "Vault" | "Hold" | "Do Not Post";

export type ApprovalStatus =
  | "Waiting" | "Approved" | "Approved With Edits"
  | "Needs Review" | "Do Not Post" | "No Tag" | "Don't Like How I Come Across";

export type IdeaStatus =
  | "New" | "Crew Favorite" | "Planned" | "Filmed"
  | "Used" | "Saved for Later" | "Archived";

export type DropType = "video" | "tiktok_link" | "idea" | "caption" | "trend" | "final_cut";

export type Platform = "tiktok" | "instagram" | "youtube" | "facebook" | "other";

export type GearItemType = "tumbler" | "mug" | "shirt" | "badge" | "sticker" | "invite" | "member_card";

export type GearStatus = "needs_name_check" | "mockup_ready" | "approved" | "ordered" | "delivered" | "hold" | "not_started";

export type IdeaCategory =
  | "Hot Takes" | "Funny Questions" | "AZ Moments" | "Group Games"
  | "Trends" | "Skits" | "BTS Chaos" | "Merch Quotes";

export type AssignmentRole =
  | "Lead" | "On-Camera" | "Reaction" | "Clip Dropper" | "Caption Help"
  | "Trend Finder" | "Editor" | "Reviewer" | "Planner" | "Behind the Scenes";

export type AssignmentTaskType =
  | "Drop a Clip" | "Drop a Link" | "Answer Prompt" | "Suggest Caption"
  | "Greenlight Clip" | "Edit/Stitch" | "Schedule Post" | "Bring Prop/Gear" | "Show Up";

export type AssignmentStatus =
  | "Not Started" | "In Progress" | "Dropped" | "Waiting on Vanessa"
  | "Needs Tweak" | "Greenlit" | "Done" | "Skipped" | "Hold";

export interface Database {
  public: {
    Tables: {
      members: {
        Relationships: [];
        Row: {
          id: string;
          user_id: string;
          email: string;
          name: string;
          role: UserRole;
          nickname: string | null;
          design_edition: string | null;
          plot_twist: string | null;
          comfort_tags: string[] | null;
          favorite_content: string[] | null;
          availability: string | null;
          socials: Record<string, string> | null;
          photo_url: string | null;
          mailing_address: string | null;
          comfort_level: string | null;
          share_comfort: string | null;
          do_not_use_for: string[] | null;
          first_wave: boolean;
          kit_acknowledged: boolean;
          ground_rules_acknowledged_at: string | null;
          can_plan_content: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          name: string;
          role?: UserRole;
          nickname?: string | null;
          design_edition?: string | null;
          plot_twist?: string | null;
          comfort_tags?: string[] | null;
          favorite_content?: string[] | null;
          availability?: string | null;
          socials?: Record<string, string> | null;
          photo_url?: string | null;
          mailing_address?: string | null;
          comfort_level?: string | null;
          share_comfort?: string | null;
          do_not_use_for?: string[] | null;
          first_wave?: boolean;
          kit_acknowledged?: boolean;
          ground_rules_acknowledged_at?: string | null;
          can_plan_content?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          name?: string;
          role?: UserRole;
          nickname?: string | null;
          design_edition?: string | null;
          plot_twist?: string | null;
          comfort_tags?: string[] | null;
          favorite_content?: string[] | null;
          availability?: string | null;
          socials?: Record<string, string> | null;
          photo_url?: string | null;
          mailing_address?: string | null;
          comfort_level?: string | null;
          share_comfort?: string | null;
          do_not_use_for?: string[] | null;
          first_wave?: boolean;
          kit_acknowledged?: boolean;
          ground_rules_acknowledged_at?: string | null;
          can_plan_content?: boolean;
          created_at?: string;
        };
      };

      invite_codes: {
        Relationships: [];
        Row: {
          id: string;
          code: string;
          name: string;
          nickname: string | null;
          email: string | null;
          plot_twist: string | null;
          favorite_content: string[] | null;
          role: UserRole;
          used: boolean;
          used_by: string | null;
          used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          nickname?: string | null;
          email?: string | null;
          plot_twist?: string | null;
          favorite_content?: string[] | null;
          role?: UserRole;
          used?: boolean;
          used_by?: string | null;
          used_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          nickname?: string | null;
          email?: string | null;
          plot_twist?: string | null;
          favorite_content?: string[] | null;
          role?: UserRole;
          used?: boolean;
          used_by?: string | null;
          used_at?: string | null;
          created_at?: string;
        };
      };

      gear: {
        Relationships: [];
        Row: {
          id: string;
          member_id: string;
          member_name: string;
          item_type: GearItemType;
          personalized_name: string | null;
          title_edition: string | null;
          mockup_url: string | null;
          status: GearStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          member_name: string;
          item_type: GearItemType;
          personalized_name?: string | null;
          title_edition?: string | null;
          mockup_url?: string | null;
          status?: GearStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          member_name?: string;
          item_type?: GearItemType;
          personalized_name?: string | null;
          title_edition?: string | null;
          mockup_url?: string | null;
          status?: GearStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      clips: {
        Relationships: [];
        Row: {
          id: string;
          title: string;
          type: DropType;
          status: ClipStatus;
          link: string | null;
          file_path: string | null;
          idea_text: string | null;
          caption: string | null;
          submitted_by: string;
          submitted_by_name: string;
          category: string | null;
          platform: Platform | null;
          destination: string | null;
          best_timestamp: string | null;
          do_not_post_notes: string | null;
          needs_review: boolean;
          scheduled_date: string | null;
          due_date: string | null;
          idea_due_date: string | null;
          clip_due_date: string | null;
          final_cut_due: string | null;
          approval_due: string | null;
          thumbnail_url: string | null;
          theme_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          type: DropType;
          status?: ClipStatus;
          link?: string | null;
          file_path?: string | null;
          idea_text?: string | null;
          caption?: string | null;
          submitted_by: string;
          submitted_by_name: string;
          category?: string | null;
          platform?: Platform | null;
          destination?: string | null;
          best_timestamp?: string | null;
          do_not_post_notes?: string | null;
          needs_review?: boolean;
          scheduled_date?: string | null;
          due_date?: string | null;
          idea_due_date?: string | null;
          clip_due_date?: string | null;
          final_cut_due?: string | null;
          approval_due?: string | null;
          thumbnail_url?: string | null;
          theme_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          type?: DropType;
          status?: ClipStatus;
          link?: string | null;
          file_path?: string | null;
          idea_text?: string | null;
          caption?: string | null;
          submitted_by?: string;
          submitted_by_name?: string;
          category?: string | null;
          platform?: Platform | null;
          destination?: string | null;
          best_timestamp?: string | null;
          do_not_post_notes?: string | null;
          needs_review?: boolean;
          scheduled_date?: string | null;
          due_date?: string | null;
          idea_due_date?: string | null;
          clip_due_date?: string | null;
          final_cut_due?: string | null;
          approval_due?: string | null;
          thumbnail_url?: string | null;
          theme_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      content_themes: {
        Relationships: [];
        Row: {
          id: string;
          name: string;
          description: string | null;
          start_date: string | null;
          end_date: string | null;
          color: string;
          status: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          color?: string;
          status?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          color?: string;
          status?: string;
          created_by?: string | null;
          created_at?: string;
        };
      };

      trend_references: {
        Relationships: [];
        Row: {
          id: string;
          title: string;
          url: string;
          platform: Platform;
          submitted_by: string;
          submitted_by_name: string;
          notes: string | null;
          theme_id: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          url: string;
          platform?: Platform;
          submitted_by: string;
          submitted_by_name: string;
          notes?: string | null;
          theme_id?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          url?: string;
          platform?: Platform;
          submitted_by?: string;
          submitted_by_name?: string;
          notes?: string | null;
          theme_id?: string | null;
          status?: string;
          created_at?: string;
        };
      };

      clip_people: {
        Relationships: [];
        Row: {
          id: string;
          clip_id: string;
          member_id: string;
          member_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          clip_id: string;
          member_id: string;
          member_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          clip_id?: string;
          member_id?: string;
          member_name?: string;
          created_at?: string;
        };
      };

      content_assignments: {
        Relationships: [];
        Row: {
          id: string;
          clip_id: string;
          member_id: string;
          member_name: string;
          role: string;
          task_type: string;
          task_title: string | null;
          task_notes: string | null;
          drop_by_date: string | null;
          is_required: boolean;
          status: string;
          completed_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clip_id: string;
          member_id: string;
          member_name: string;
          role?: string;
          task_type?: string;
          task_title?: string | null;
          task_notes?: string | null;
          drop_by_date?: string | null;
          is_required?: boolean;
          status?: string;
          completed_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clip_id?: string;
          member_id?: string;
          member_name?: string;
          role?: string;
          task_type?: string;
          task_title?: string | null;
          task_notes?: string | null;
          drop_by_date?: string | null;
          is_required?: boolean;
          status?: string;
          completed_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      assignment_comments: {
        Relationships: [];
        Row: {
          id: string;
          assignment_id: string;
          member_id: string;
          member_name: string;
          comment: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          member_id: string;
          member_name: string;
          comment: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          assignment_id?: string;
          member_id?: string;
          member_name?: string;
          comment?: string;
          created_at?: string;
        };
      };

      approvals: {
        Relationships: [];
        Row: {
          id: string;
          clip_id: string;
          member_id: string;
          member_name: string;
          status: ApprovalStatus;
          edit_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clip_id: string;
          member_id: string;
          member_name: string;
          status?: ApprovalStatus;
          edit_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clip_id?: string;
          member_id?: string;
          member_name?: string;
          status?: ApprovalStatus;
          edit_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      ideas: {
        Relationships: [];
        Row: {
          id: string;
          title: string;
          category: IdeaCategory;
          status: IdeaStatus;
          energy: string | null;
          submitted_by: string;
          submitted_by_name: string;
          notes: string | null;
          crew_favorite: boolean;
          votes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          category: IdeaCategory;
          status?: IdeaStatus;
          energy?: string | null;
          submitted_by: string;
          submitted_by_name: string;
          notes?: string | null;
          crew_favorite?: boolean;
          votes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          category?: IdeaCategory;
          status?: IdeaStatus;
          energy?: string | null;
          submitted_by?: string;
          submitted_by_name?: string;
          notes?: string | null;
          crew_favorite?: boolean;
          votes?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      comments: {
        Relationships: [];
        Row: {
          id: string;
          clip_id: string | null;
          idea_id: string | null;
          author_id: string;
          author_name: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          clip_id?: string | null;
          idea_id?: string | null;
          author_id: string;
          author_name: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          clip_id?: string | null;
          idea_id?: string | null;
          author_id?: string;
          author_name?: string;
          body?: string;
          created_at?: string;
        };
      };

      notifications: {
        Relationships: [];
        Row: {
          id: string;
          user_id: string;
          kind: string;
          body: string;
          link: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          kind: string;
          body: string;
          link?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          kind?: string;
          body?: string;
          link?: string | null;
          read?: boolean;
          created_at?: string;
        };
      };

      activity: {
        Relationships: [];
        Row: {
          id: string;
          actor_id: string | null;
          actor_name: string;
          kind: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          actor_name: string;
          kind: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          actor_name?: string;
          kind?: string;
          body?: string;
          created_at?: string;
        };
      };
    };

    Views: {
      clips_with_meta: {
        Relationships: [];
        Row: {
          id: string;
          title: string;
          type: DropType;
          status: ClipStatus;
          link: string | null;
          file_path: string | null;
          idea_text: string | null;
          caption: string | null;
          submitted_by: string;
          submitted_by_name: string;
          category: string | null;
          platform: Platform | null;
          destination: string | null;
          best_timestamp: string | null;
          do_not_post_notes: string | null;
          needs_review: boolean;
          scheduled_date: string | null;
          due_date: string | null;
          idea_due_date: string | null;
          clip_due_date: string | null;
          final_cut_due: string | null;
          approval_due: string | null;
          thumbnail_url: string | null;
          theme_id: string | null;
          created_at: string;
          updated_at: string;
          people_count: number;
          approvals_total: number;
          approvals_approved: number;
          approvals_waiting: number;
          approvals_blocked: number;
        };
      };
    };

    Functions: {
      has_role: { Args: { _role: UserRole }; Returns: boolean };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      current_member_id: { Args: Record<string, never>; Returns: string };
      is_member_of_clip: { Args: { _clip_id: string }; Returns: boolean };
    };

    Enums: {
      user_role: UserRole;
      clip_status: ClipStatus;
      approval_status: ApprovalStatus;
      idea_status: IdeaStatus;
      drop_type: DropType;
      platform: Platform;
      idea_category: IdeaCategory;
    };
  };
}
