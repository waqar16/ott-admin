# UR VIEW — Functional Product Overview

## 1. Project Overview

**UR VIEW** is a next-generation Over-The-Top (OTT) media platform designed to deliver standard and immersive streaming experiences directly to consumers. Developed to meet the demands of modern digital media distribution, the platform integrates multi-tier user subscriptions, individual Pay-Per-View (PPV) releases, and device limit enforcement, all while incorporating a secure, child-safe environment (the Kids Zone). Behind the scenes, the platform coordinates media ingestion, compression, and encoding, allowing content publishers to deliver high-fidelity streams across diverse devices while monitoring operational metrics via a dedicated administrative dashboard.

Unlike basic content management systems, UR VIEW is built around an immersive-first media strategy. The platform natively supports both flat videos and spatial projection layouts, including 180-degree and 360-degree monoscopic and stereoscopic formats. This capability allows users to explore virtual reality environments right from their standard web browsers or compatible mobile devices. By integrating virtual reality alongside traditional catalog layouts, UR VIEW serves as a bridge between conventional cinema, educational programming, and interactive media.

Financially and operationally, the platform relies on a dual monetization strategy. It balances recurring monthly subscriptions (with varying device limits) with one-time ticket sales for exclusive content premiering on the service. These front-end capabilities are powered by an automated media processing engine that processes raw uploads on-the-fly, producing optimized WebP images and multi-resolution adaptive video streams to guarantee smooth, buffer-free playback regardless of screen size or user bandwidth.

---

## 2. Purpose of the Platform

The primary purpose of UR VIEW is to provide a single, unified ecosystem for distributing, monetizing, and viewing modern digital media, bridging the gap between traditional streaming and next-generation virtual reality experiences.

Historically, streaming platforms have been fragmented: consumers visit mainstream services for movies and series, but must seek specialized applications for immersive 180-degree or 360-degree media. UR VIEW solves this by hosting standard movies, serialized shows, trailers, documentaries, and spatial virtual reality content in a single consolidated catalog.

The platform addresses several critical challenges in the digital streaming space:

- **Monetization Flexibility:** It eliminates the need for publishers to choose between a subscription model and transaction-based pricing. By supporting both monthly membership tiers and individual Pay-Per-View purchases, the platform accommodates diverse viewing habits and premium content releases.
- **Child Safety and Parental Control:** Ensuring a safe online environment for children is a top priority for families. UR VIEW solves this by offering a sandboxed Kids Zone that filters out mature content, disables social interactions like comments, simplifies navigation, and locks the exit behind a parental PIN.
- **Access Control and Device Management:** Account sharing and excessive concurrent sessions can erode subscription revenue. UR VIEW maps specific device limits to each subscription level and offers a user-facing device management panel where members can audit active sessions and disconnect unauthorized devices.
- **Ingestion and Transcoding Automation:** Managing video encoding, file compression, and poster/banner resizing is a major operational bottleneck for media companies. UR VIEW automates this pipeline, converting single raw uploads into adaptive streams and multi-resolution optimized image variants with no manual intervention.

---

## 3. Target Users

UR VIEW serves four main categories of users, each interacting with the system through specialized interfaces, controls, and permissions:

- **General Consumers & Subscribers:** Users looking for high-quality entertainment and immersive viewing. Free tier members can stream basic content, while premium subscribers pay a monthly fee to unlock high-definition, ad-free streaming, mature titles, and VR experiences across multiple devices.
- **Parents & Children:** Families seeking secure content. Parents configure parental locks, set account PINs, and manage profiles. Children browse using the "Kids Zone," a playful, simplified interface that displays only kid-safe titles rated TV-Y, TV-Y7, or G.
- **Content Creators & Publishers:** Independent filmmakers, VR studios, and media partners who publish content. Creators upload media files, define metadata (genre, cast, director, content ratings), set visibility parameters, and monitor how audiences interact with their work.
- **Platform Administrators:** Operators and business owners responsible for managing platform health. Administrators manage billing configurations, catalog visibility, user account statuses (suspending or banning accounts), global settings, marketing copy, and review platform-wide analytics.

---

## 4. Key Functionalities

### Consumer-Facing Features

- **Tiered Subscription Access:** Users register and select from three membership plans:
  - **Free Tier:** Access to basic catalog titles, limited to 1 registered device, and ad-supported.
  - **Kids Tier:** Full access to child-safe content and the Kids Zone, limited to 2 registered devices.
  - **Full Tier:** Unrestricted access to the entire catalog (including mature titles and VR experiences), high-definition playback, and up to 5 concurrent registered devices.
- **Pay-Per-View (PPV) & Premieres:** Users can buy individual tickets for exclusive "Premiere Titles" (such as new film releases, documentaries, or live events). Once purchased, access is granted for a specific duration, independent of the user's monthly subscription status.
- **Immersive VR Media Player:** The integrated player supports multiple projection modes, allowing users to watch spatial video directly in the browser:
  - **Flat:** Standard widescreen video.
  - **VR 180 & 360 Monoscopic:** Panoramic views where users look around the scene using drag-to-look controls.
  - **VR 180 & 360 Stereoscopic:** Immersive 3D projections formatted in Side-by-Side (SBS) or Top-and-Bottom (TB) layouts, compatible with virtual reality headsets.
- **The Kids Zone:** A sandboxed workspace featuring large thumbnails, bright colors, and simplified menus. Access to the main catalog is blocked by a 4-digit parental PIN. All comments, user uploads, billing screens, and adult content are hidden.
- **Device Management Panel:** Users can monitor active devices connected to their account, view device types (web, mobile, TV, tablet), see last-active timestamps, and manually disconnect devices to free up active slots.
- **Subscription Management Portal:** A billing center where subscribers can check plan details, view invoice history, upgrade/downgrade tiers, update payment methods, or cancel and reactivate subscriptions.

### Administrative & Creator Features

- **Automated Ingestion Pipeline:** Admins create content records as drafts and upload media files. The system automatically processes the files in the cloud:
  - **Video Transcoding:** Converts raw video into HLS and DASH adaptive streaming formats with multiple quality renditions (1080p, 720p, 480p) to optimize delivery based on user bandwidth.
  - **Thumbnail Extraction:** Automatically extracts a sequence of preview frames to enable visual timeline scrubbing in the player.
  - **Image Optimization:** Resizes and compresses posters, banners, and thumbnails into modern, high-performance WebP formats alongside standard JPEG/PNG fallbacks.
- **Catalog Visibility Controls:** Admins manage content rollout using specialized status flags:
  - **Visible Without Signup:** Places selected high-quality titles on the public landing page to attract unregistered visitors.
  - **Demo Content:** Marks titles as free samples that anyone can stream without logging in or subscribing.
  - **Beta Visibility:** Restricts access to selected titles so that only administrators and beta testers can preview and test them before global release.
- **Comprehensive Analytics Dashboard:** Provides real-time metrics across five categories:
  - **User Stats:** Monitors total users, new user growth over time, active vs. inactive users, and role breakdowns (admin, beta tester, regular user).
  - **Subscription Analytics:** Tracks active, trialing, past-due, and canceled subscriptions, and calculates subscriber churn rate by plan.
  - **Revenue Analytics:** Reports total revenue (all time vs. last 30 days), monthly recurring revenue (MRR), average revenue per paying user (ARPPU), and subscription vs. PPV revenue splits.
  - **Content Analytics:** Analyzes watch time, completion rates (completions vs. starts), drop-off metrics at key milestones (25%, 50%, 75%), PPV sales performance, and top-performing movies/series.
  - **Engagement Analytics:** Captures concurrent active users, peak viewing hours, and distribution of views by device type (web, iOS, Android).
- **FAQ Management System:** A dedicated dashboard for administrators to create, update, and organize frequently asked questions to help users resolve common issues.
- **Theme & Copy Customization:** Admins can edit landing and login screen texts, headings, call-to-action buttons, and footer links (privacy policy, terms of service, support contact) directly from the console.

---

## 5. Typical User Workflow

### Content Ingestion and Publishing Workflow (Backend to Frontend)

1. **Metadata Entry:** An administrator logs into the admin panel and creates a new content card, entering titles, descriptions, genres, creators, cast, age ratings, content type (movie, series, episode, or documentary), and media projection type (flat vs. VR format). The content is saved in a **Draft** status.
2. **File Ingestion:** The admin uploads the primary video file along with poster/banner image files directly from the browser. For large video files, the system chunks the media using a multipart cloud upload to ensure transfer stability.
3. **Automated Cloud Processing:**
   - The upload triggers the processing pipeline.
   - Image files are compressed and formatted into multiple resolutions in WebP and JPEG.
   - The video file is processed by a cloud transcoder, generating high-definition adaptive streaming files (HLS and DASH manifests with multiple segment folders) and a collection of frame thumbnails.
   - Status is updated to **Processing** and finally **Ready**.
4. **Quality Assurance & Testing:** The administrator assigns the title a **Beta** visibility mode. Beta testers log in and play the video in their browsers to verify audio, subtitle synchronization, video quality, and VR projections.
5. **Public Launch:** Once approved, the admin updates the status to **Published** and sets visibility to **Public**. If the admin enables "Visible Without Signup" or "Demo Content," the title is pushed to the public landing page.

### Consumer Viewing and Subscription Workflow

1. **Discovery:** A non-registered visitor lands on the website. They browse the public catalog preview. Seeing a title marked as "Demo Content," they click play and stream the video immediately.
2. **Registration:** Impressed by the video quality, the user clicks the call-to-action button, completes the signup form, and verifies their account. They are now an authenticated **Free Member** (limited to 1 device).
3. **Subscription Upgrade:** To unlock premium movies and VR concert experiences, the user navigates to the plans page and chooses the **Full subscription**. They are redirected to a secure billing checkout, complete their payment, and are redirected back to the platform. Their session updates to reflect their new **Full Subscriber** status.
4. **Profile Creation:** The user sets up three distinct profiles: one for themselves, one for a family member (secured with a 4-digit PIN), and one for their child (marked as a **Kids Profile**).
5. **Immersive Viewing:** The user logs into their primary profile, browses the VR category, puts on a mobile virtual reality headset, selects a 360-degree stereoscopic concert video, and clicks play to enter the virtual crowd.
6. **Child Browsing:** Later, the user switches the account profile to the child's profile. The interface transitions to the **Kids Zone**, changing to a colorful yellow-and-pink theme. The child can search and play animated series without seeing mature content or access billing. To exit the Kids Zone back to the adult dashboard, the user must enter the parental PIN.

---

## 6. Business Benefits

UR VIEW delivers substantial commercial and operational value to media distributors, content creators, and enterprise stakeholders:

- **Maximizing Audience Conversion:** By allowing administrators to flag specific high-value content as publicly visible or playable without signup (demo mode), the platform lowers onboarding friction, acts as a powerful marketing funnel, and converts casual visitors into registered users.
- **Dual Revenue Monetization:** Traditional subscription-only models miss out on high-intent transactional revenue. UR VIEW captures both recurring monthly subscription fees (steady cash flow) and episodic, high-margin Pay-Per-View sales (maximizing revenue from premium releases and live events).
- **Proactive Churn Minimization:** Through the Content Analytics Dashboard, managers can monitor completion and drop-off rates at 25%, 50%, and 75% marks. If a series has high drop-offs at the 25% mark, creative teams can investigate pacing issues. If users frequently experience buffering, administrators can adjust transcoding parameters.
- **Optimized Operational Costs:** The serverless media processing pipeline eliminates the need for full-time technical staff to convert, compress, and host video assets manually. Automatic WebP image compression reduces CDN bandwidth consumption, lowering hosting bills.
- **Enhanced Brand Protection:** Enforcing device limits prevent unauthorized credential sharing. Ringfencing kids content behind parental PINs shields the brand from regulatory issues and negative customer reviews regarding child safety.

---

## 7. Executive Summary

UR VIEW is a next-generation, high-performance Over-The-Top (OTT) media platform designed to capture the growing demand for standard digital entertainment and immersive virtual reality experiences. By combining a unified web-based catalog with support for standard video and spatial projection modes (180° and 360° monoscopic and stereoscopic views), UR VIEW bridges the gap between conventional media and emerging virtual reality platforms.

The platform is built to optimize monetization and user retention. It implements a flexible dual-monetization framework, allowing operators to deploy tiered subscription models (Free, Kids, Full) alongside individual Pay-Per-View (PPV) ticket purchases for premium premieres. To maximize visitor-to-subscriber conversions, the platform features catalog-visibility flags, including "Visible Without Signup" and "Demo Content" controls, which enable operators to showcase and sample selected media on public landing pages.

Family security and operational efficiency are integrated into the core architecture. The platform features a dedicated Kids Zone, providing children with a sandboxed, simplified, and colorful interface showing only child-safe content, with all exit routes protected by a secure 4-digit parental PIN. Operationally, UR VIEW reduces administrative overhead through an automated media ingestion and transcoding pipeline that automatically formats raw videos into adaptive HLS/DASH streams, extracts frame thumbnails, and optimizes promotional graphics into modern compressed formats.

For business owners and managers, the platform provides a detailed Analytics Dashboard. This dashboard monitors real-time metrics across user growth, subscription statuses, revenue performance (such as Monthly Recurring Revenue and Average Revenue Per Paying User), content completion/drop-off rates, and device usage statistics. With features like device-limit enforcement and active session management, UR VIEW mitigates account abuse and secures recurring revenue. Ultimately, UR VIEW represents a scalable, business-ready solution for media distributors seeking to capture the future of digital and immersive entertainment.
