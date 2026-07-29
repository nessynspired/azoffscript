/**
 * Typed Database schema for AZ Off Script — The Off Script Room.
 * Mirrors supabase/schema.sql exactly. Used by Supabase clients for type-safe queries.
 */

export type UserRole = "admin" | "member";
export type ProfileApprovalStatus = "Draft" | "Submitted" | "Needs Review" | "Approved" | "Rejected" | "Archived";
export type PhotoPermissionStatus =
  | "Pending Upload"
  | "Pending Review"
  | "Approved for Website"
  | "Approved for Portal Only"
  | "Approved for Email Signature"
  | "Rejected / Needs New Photo";
export type TagPreference = "yes" | "no" | "ask_every_time";
export type ProfileVisibility = "public" | "portal_only" | "hidden";

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

export type JoinSubmissionStatus = "New" | "Contacted" | "Approved" | "Rejected" | "Archived";

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
          room_vibe: string[] | null;
          tag_me: string | null;
          best_platform: string | null;
          first_wave: boolean;
          kit_acknowledged: boolean;
          ground_rules_acknowledged_at: string | null;
          can_plan_content: boolean;
          public_visible: boolean;
          public_bio: string | null;
          slug: string | null;
          display_order: number;
          card_image: string | null;
          gear_image: string | null;
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
          room_vibe?: string[] | null;
          tag_me?: string | null;
          best_platform?: string | null;
          first_wave?: boolean;
          kit_acknowledged?: boolean;
          ground_rules_acknowledged_at?: string | null;
          can_plan_content?: boolean;
          public_visible?: boolean;
          public_bio?: string | null;
          slug?: string | null;
          display_order?: number;
          card_image?: string | null;
          gear_image?: string | null;
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
          room_vibe?: string[] | null;
          tag_me?: string | null;
          best_platform?: string | null;
          first_wave?: boolean;
          kit_acknowledged?: boolean;
          ground_rules_acknowledged_at?: string | null;
          can_plan_content?: boolean;
          public_visible?: boolean;
          public_bio?: string | null;
          slug?: string | null;
          display_order?: number;
          card_image?: string | null;
          gear_image?: string | null;
          created_at?: string;
        };
      };
      site_settings: {
        Relationships: [];
        Row: {
          key: string;
          value: string;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: string;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: string;
          updated_at?: string;
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
          template_id: string | null;
          planned_clip_id: string | null;
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
          template_id?: string | null;
          planned_clip_id?: string | null;
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
          template_id?: string | null;
          planned_clip_id?: string | null;
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

      deleted_rows: {
        Relationships: [];
        Row: {
          id: string;
          table_name: string;
          row_id: string;
          data: Record<string, unknown>;
          deleted_by: string | null;
          deleted_at: string;
        };
        Insert: {
          id?: string;
          table_name: string;
          row_id: string;
          data: Record<string, unknown>;
          deleted_by?: string | null;
          deleted_at?: string;
        };
        Update: {
          id?: string;
          table_name?: string;
          row_id?: string;
          data?: Record<string, unknown>;
          deleted_by?: string | null;
          deleted_at?: string;
        };
      };

      deleted_files: {
        Relationships: [];
        Row: {
          id: string;
          bucket_id: string;
          file_path: string;
          file_url: string | null;
          file_size: number | null;
          mime_type: string | null;
          deleted_by: string | null;
          deleted_at: string;
        };
        Insert: {
          id?: string;
          bucket_id: string;
          file_path: string;
          file_url?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          deleted_by?: string | null;
          deleted_at?: string;
        };
        Update: {
          id?: string;
          bucket_id?: string;
          file_path?: string;
          file_url?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          deleted_by?: string | null;
          deleted_at?: string;
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

      push_subscriptions: {
        Relationships: [];
        Row: {
          id: string;
          member_id: string;
          endpoint: string;
          p256dh: string;
          auth_key: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          endpoint: string;
          p256dh: string;
          auth_key: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          endpoint?: string;
          p256dh?: string;
          auth_key?: string;
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

      join_submissions: {
        Relationships: [{ foreignKeyName: "join_submissions_converted_invite_id_fkey"; columns: ["converted_invite_id"]; referencedRelation: "invite_codes"; referencedColumns: ["id"] }];
        Row: {
          id: string;
          name: string;
          city: string;
          email: string | null;
          socials: string | null;
          comfortable_on_camera: string | null;
          content_type: string | null;
          roles: string[] | null;
          availability: string | null;
          boundaries: string | null;
          why: string | null;
          lane: string | null;
          guest_or_recurring: string | null;
          clips_not_guaranteed: string | null;
          content_interests: string[] | null;
          availability_slots: string[] | null;
          willingness: string | null;
          anything_else: string | null;
          status: JoinSubmissionStatus;
          converted_invite_id: string | null;
          admin_notes: string | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          city: string;
          email?: string | null;
          socials?: string | null;
          comfortable_on_camera?: string | null;
          content_type?: string | null;
          roles?: string[] | null;
          availability?: string | null;
          boundaries?: string | null;
          why?: string | null;
          lane?: string | null;
          guest_or_recurring?: string | null;
          clips_not_guaranteed?: string | null;
          content_interests?: string[] | null;
          availability_slots?: string[] | null;
          willingness?: string | null;
          anything_else?: string | null;
          status?: JoinSubmissionStatus;
          converted_invite_id?: string | null;
          admin_notes?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          city?: string;
          email?: string | null;
          socials?: string | null;
          comfortable_on_camera?: string | null;
          content_type?: string | null;
          roles?: string[] | null;
          availability?: string | null;
          boundaries?: string | null;
          why?: string | null;
          lane?: string | null;
          guest_or_recurring?: string | null;
          clips_not_guaranteed?: string | null;
          content_interests?: string[] | null;
          availability_slots?: string[] | null;
          willingness?: string | null;
          anything_else?: string | null;
          status?: JoinSubmissionStatus;
          converted_invite_id?: string | null;
          admin_notes?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      revenue_events: {
        Relationships: [];
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          title: string;
          description: string | null;
          revenue_type: "Paid Content" | "Platform Revenue" | "Merch Revenue" | "Events";
          split_template: "Paid Content" | "Platform Revenue" | "Merch Revenue" | "Custom";
          disclosure: "None" | "Sponsored" | "Gifted" | "Affiliate" | "Paid Partnership";
          gross_cents: number;
          expenses_cents: number;
          net_cents: number;
          planner_involved: boolean;
          planner_id: string | null;
          contributor_ids: string[];
          promo_contributor_ids: string[];
          status: "Draft" | "Pending Approval" | "Approved" | "Paid" | "On Hold";
          agreement_signed: boolean;
          paid_out: boolean;
          paid_at: string | null;
          clip_id: string | null;
          created_by: string | null;
          approved_by: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          title: string;
          description?: string | null;
          revenue_type?: "Paid Content" | "Platform Revenue" | "Merch Revenue" | "Events";
          split_template?: "Paid Content" | "Platform Revenue" | "Merch Revenue" | "Custom";
          disclosure?: "None" | "Sponsored" | "Gifted" | "Affiliate" | "Paid Partnership";
          gross_cents: number;
          expenses_cents?: number;
          planner_involved?: boolean;
          planner_id?: string | null;
          contributor_ids?: string[];
          promo_contributor_ids?: string[];
          status?: "Draft" | "Pending Approval" | "Approved" | "Paid" | "On Hold";
          agreement_signed?: boolean;
          paid_out?: boolean;
          paid_at?: string | null;
          clip_id?: string | null;
          created_by?: string | null;
          approved_by?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          revenue_type?: "Paid Content" | "Platform Revenue" | "Merch Revenue" | "Events";
          split_template?: "Paid Content" | "Platform Revenue" | "Merch Revenue" | "Custom";
          disclosure?: "None" | "Sponsored" | "Gifted" | "Affiliate" | "Paid Partnership";
          gross_cents?: number;
          expenses_cents?: number;
          planner_involved?: boolean;
          planner_id?: string | null;
          contributor_ids?: string[];
          promo_contributor_ids?: string[];
          status?: "Draft" | "Pending Approval" | "Approved" | "Paid" | "On Hold";
          agreement_signed?: boolean;
          paid_out?: boolean;
          paid_at?: string | null;
          clip_id?: string | null;
          approved_by?: string | null;
        };
      };

      approved_public_profile: {
        Relationships: [];
        Row: {
          id: string;
          member_id: string;
          legal_name: string | null;
          display_name: string | null;
          preferred_website_name: string | null;
          preferred_email_signature_name: string | null;
          public_title: string | null;
          secondary_role: string | null;
          short_personality_line: string | null;
          website_bio: string | null;
          portal_avatar_url: string | null;
          website_photo_url: string | null;
          email_signature_photo_url: string | null;
          social_handle: string | null;
          tag_preference: TagPreference | null;
          profile_visibility: ProfileVisibility | null;
          photo_permission_status: PhotoPermissionStatus | null;
          profile_approval_status: ProfileApprovalStatus | null;
          requested_changes_note: string | null;
          admin_review_note: string | null;
          approved_by: string | null;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          legal_name?: string | null;
          display_name?: string | null;
          preferred_website_name?: string | null;
          preferred_email_signature_name?: string | null;
          public_title?: string | null;
          secondary_role?: string | null;
          short_personality_line?: string | null;
          website_bio?: string | null;
          portal_avatar_url?: string | null;
          website_photo_url?: string | null;
          email_signature_photo_url?: string | null;
          social_handle?: string | null;
          tag_preference?: TagPreference | null;
          profile_visibility?: ProfileVisibility | null;
          photo_permission_status?: PhotoPermissionStatus | null;
          profile_approval_status?: ProfileApprovalStatus | null;
          requested_changes_note?: string | null;
          admin_review_note?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          legal_name?: string | null;
          display_name?: string | null;
          preferred_website_name?: string | null;
          preferred_email_signature_name?: string | null;
          public_title?: string | null;
          secondary_role?: string | null;
          short_personality_line?: string | null;
          website_bio?: string | null;
          portal_avatar_url?: string | null;
          website_photo_url?: string | null;
          email_signature_photo_url?: string | null;
          social_handle?: string | null;
          tag_preference?: TagPreference | null;
          profile_visibility?: ProfileVisibility | null;
          photo_permission_status?: PhotoPermissionStatus | null;
          profile_approval_status?: ProfileApprovalStatus | null;
          requested_changes_note?: string | null;
          admin_review_note?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          updated_at?: string;
        };
      };

      profile_change_requests: {
        Relationships: [];
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          member_id: string;
          display_name: string | null;
          preferred_website_name: string | null;
          preferred_email_signature_name: string | null;
          public_title: string | null;
          secondary_role: string | null;
          short_personality_line: string | null;
          website_bio: string | null;
          portal_avatar_url: string | null;
          website_photo_url: string | null;
          email_signature_photo_url: string | null;
          social_handle: string | null;
          tag_preference: TagPreference | null;
          profile_visibility: ProfileVisibility | null;
          requested_changes_note: string | null;
          status: ProfileApprovalStatus;
          admin_review_note: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          member_id: string;
          display_name?: string | null;
          preferred_website_name?: string | null;
          preferred_email_signature_name?: string | null;
          public_title?: string | null;
          secondary_role?: string | null;
          short_personality_line?: string | null;
          website_bio?: string | null;
          portal_avatar_url?: string | null;
          website_photo_url?: string | null;
          email_signature_photo_url?: string | null;
          social_handle?: string | null;
          tag_preference?: TagPreference | null;
          profile_visibility?: ProfileVisibility | null;
          requested_changes_note?: string | null;
          status?: ProfileApprovalStatus;
          admin_review_note?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
        Update: {
          display_name?: string | null;
          preferred_website_name?: string | null;
          preferred_email_signature_name?: string | null;
          public_title?: string | null;
          secondary_role?: string | null;
          short_personality_line?: string | null;
          website_bio?: string | null;
          portal_avatar_url?: string | null;
          website_photo_url?: string | null;
          email_signature_photo_url?: string | null;
          social_handle?: string | null;
          tag_preference?: TagPreference | null;
          profile_visibility?: ProfileVisibility | null;
          requested_changes_note?: string | null;
          status?: ProfileApprovalStatus;
          admin_review_note?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          updated_at?: string;
        };
      };

      agreements: {
        Relationships: [];
        Row: {
          id: string;
          created_at: string;
          version: string;
          title: string;
          summary: string | null;
          body_markdown: string;
          status: "Draft" | "Active" | "Retired";
          activated_at: string | null;
          retired_at: string | null;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          version: string;
          title: string;
          summary?: string | null;
          body_markdown: string;
          status?: "Draft" | "Active" | "Retired";
          activated_at?: string | null;
          retired_at?: string | null;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          version?: string;
          title?: string;
          summary?: string | null;
          body_markdown?: string;
          status?: "Draft" | "Active" | "Retired";
          activated_at?: string | null;
          retired_at?: string | null;
        };
      };

      agreement_signatures: {
        Relationships: [];
        Row: {
          id: string;
          created_at: string;
          agreement_id: string;
          member_id: string;
          member_name: string;
          member_email: string | null;
          member_phone: string | null;
          social_handles: string | null;
          printed_name: string;
          ip_address: string | null;
          user_agent: string | null;
          acknowledged_checklist: boolean;
          signature_data: string | null;
          signed_date: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          agreement_id: string;
          member_id: string;
          member_name: string;
          member_email?: string | null;
          member_phone?: string | null;
          social_handles?: string | null;
          printed_name: string;
          ip_address?: string | null;
          user_agent?: string | null;
          acknowledged_checklist?: boolean;
          signature_data?: string | null;
          signed_date?: string | null;
        };
        Update: {
          id?: string;
          member_email?: string | null;
          member_phone?: string | null;
          social_handles?: string | null;
          printed_name?: string;
          acknowledged_checklist?: boolean;
          signature_data?: string | null;
          signed_date?: string | null;
        };
      };
      quick_terms_acceptances: {
        Relationships: [];
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          member_id: string;
          agreement_type: "quick_terms" | "creator_release" | "revenue_addendum";
          agreement_version: string;
          accepted_at: string;
          accepted_ip: string | null;
          user_agent: string | null;
          accepted_checkbox_snapshot: string[];
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          member_id: string;
          agreement_type?: "quick_terms" | "creator_release" | "revenue_addendum";
          agreement_version: string;
          accepted_at?: string;
          accepted_ip?: string | null;
          user_agent?: string | null;
          accepted_checkbox_snapshot: string[];
        };
        Update: {
          accepted_ip?: string | null;
          user_agent?: string | null;
        };
      };
      agreement_audit_log: {
        Relationships: [];
        Row: {
          id: string;
          created_at: string;
          action: string;
          agreement_id: string | null;
          signature_id: string | null;
          member_id: string | null;
          auth_user_id: string | null;
          member_email: string | null;
          ip_address: string | null;
          user_agent: string | null;
          metadata: Record<string, unknown> | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          action: string;
          agreement_id?: string | null;
          signature_id?: string | null;
          member_id?: string | null;
          auth_user_id?: string | null;
          member_email?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Record<string, unknown> | null;
        };
        Update: {
          id?: string;
          action?: string;
          metadata?: Record<string, unknown> | null;
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
          template_id: string | null;
          planned_clip_id: string | null;
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
      restore_deleted_row: { Args: { p_archive_id: string }; Returns: void };
    };

    Enums: {
      user_role: UserRole;
      clip_status: ClipStatus;
      approval_status: ApprovalStatus;
      idea_status: IdeaStatus;
      drop_type: DropType;
      platform: Platform;
      idea_category: IdeaCategory;
      join_submission_status: JoinSubmissionStatus;
    };
  };
}
