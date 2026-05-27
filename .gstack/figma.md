# Figma Design Context — wjGYCnQg7UU19Hh5HWOmwa

## Visual Intent Per Frame

### Frame: All visitor (node 40:3991)
**Purpose**: Display a comprehensive list of all registered visitors with their check-in/out status, host information, and actions.

**Key Elements**:
1. **Header Section** (top-right area):
   - Greeting: "Welcome back John!" (personalized greeting with username)
   - Search bar: "Search Visitor, Passes" with search icon
   - Notification bell icon (top-right)
   - Light/Dark mode toggle
   - User avatar menu

2. **Sidebar Navigation** (left side, ~274px wide):
   - VISITOR logo with "Powered by CHANGEPOND" text
   - Navigation items with icons:
     - 📊 Dashboard
     - 👥 All Visitor (highlighted/active)
     - 🚪 Gate Check-In
     - 🚪 Gate Check-Out
     - 📋 Reports
     - ⚙️ Settings
   - Icons are consistent with Vuesax design system

3. **Main Content Area** (right side, ~1118px wide):
   - **Title Bar**: "All Visitors" (24px, Inter Semi Bold, dark text)
   - **Action Button**: "Add Visitor" (purple button, #5B21B6, top-right)
   - **Subtitle**: "List of all Visitors"
   - **Search/Filter**: Search box (text input) + Filter icon (vuesax/linear/filter)

4. **Data Table**:
   - **Columns** (in order): Name, Company, Host, Purpose, Check-in Time, Check-out Time, Status, Badge, Action
   - **Header Row**: Gray background (#F6F6F6), bold text, secondary color (#727272), 12px font
   - **Data Rows**: White background, alternating row heights, visitor avatars (circular profile images)
   - **Status Badges**: Color-coded
     - ✅ Check in (green)
     - ⏳ Waiting (orange)
     - ✔️ Checked Out (purple)
     - ❌ Expired Pass (red)
     - ⏱️ Pending Approval (orange)
   - **Action Icons**: Eye (visibility) + Pencil (edit)
   - **Sample Data**: 10 visible rows (Mathew, Sarah, John, Emily, David, James, Sophia, Daniel, Olivia, Liam)

5. **Footer Section**:
   - **Pagination**: "Show 10 of 32 Records" with page numbers (1, 2, 3, 4) and next arrow
   - **Copyright**: "Copyright 2026 Changepond. All Rights Reserved." (12px, Poppins Regular)
   - Footer background: white, border-top: light gray (#E2E2E2)

---

## Design Tokens

### Colors
- **Primary Brand**: 
  - Purple (#5B21B6) — buttons, active states, accents
  - Off-white background (#FAF8F5) — main page background
  
- **Text Colors**:
  - Primary text (#171717) — dark, high contrast for readability
  - Secondary text (#727272) — labels, helper text, disabled states
  
- **UI Elements**:
  - Card/Panel background: white (#FFFFFF)
  - Table header background: light gray (#F6F6F6)
  - Border colors: #E2E2E2 (lighter), #BABABA (medium)
  - Shadow: rgba(0, 0, 0, 0.12) for depth
  
- **Status Colors**:
  - Success/Check in: green (implied, not specified in design)
  - Warning/Waiting: orange (implied)
  - Info/Checked Out: purple (#5B21B6 or similar)
  - Error/Expired: red (implied)
  - Pending: orange (implied)

### Typography
- **Font Family**: Inter (primary), Poppins (fallback for footer)
- **Font Weights**:
  - Regular: 400 (body text, footer)
  - Medium: 500 (body, secondary headers)
  - Semi Bold: 600 (table headers, labels, button text)
  
- **Font Sizes**:
  - Page title (All Visitors): 24px, Semi Bold
  - Subtitle (List of all Visitors): 16px, Medium
  - Table header: 12px, Semi Bold
  - Table data: 12px, Regular
  - Footer: 12px, Regular (Poppins)

### Spacing & Layout
- **Sidebar width**: 274px (fixed)
- **Main content width**: 1118px (remaining)
- **Padding**: 
  - Page title area: 24px padding
  - Table cells: 8px horizontal, 10px vertical
  - Card radius: 16px
  
- **Gap/Margin**: 20px between major sections
- **Table row height**: ~45px (with 10px vertical padding + content)

### Shadows
- Card shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.12)
- Subtle depth on white cards over background

### Icons (Vuesax Linear Design System)
- Filter icon (linear style)
- Eye icon (visibility, linear style)
- Pencil icon (edit, linear style)
- Expand More icon (dropdown, linear style)
- Dashboard, Patient List, How to Register, Follow the Signs, Docs icons (sidebar navigation)

---

## Visual Spec Per Frame

### All Visitor Frame — Detailed Layout

**Canvas**: 1400px wide × 1056px tall, background color #FAF8F5

#### Section 1: Header (top area)
- **Greeting**: "Welcome back John!" 
  - Position: top-right area (300px from right)
  - Font: Inter Medium, 24px, color #171717
  
- **Search Bar**:
  - Position: right-center of header
  - Size: ~400px wide × 40px tall
  - Placeholder: "Search Visitor, Passes"
  - Border: light gray, rounded 8px
  - Icon: search/filter icon on right inside input field
  
- **Top-right Icons** (stacked vertically):
  - Notification bell (🔔)
  - Light/Dark toggle (🌙/☀️)
  - User avatar circle (profile picture, 40x40px)

#### Section 2: Sidebar (left column)
- **Sidebar Container**:
  - Position: left edge, full height
  - Width: 274px
  - Background: white or light background
  - Padding: 16px all sides
  
- **Logo**: 
  - VISITOR text + "Powered by CHANGEPOND" subtext
  - Logo image (CPT logo SVG)
  
- **Navigation Items** (stacked vertically, gaps of 16px):
  - Icon (20x20px) + Text label
  - Selected item (All Visitor): Light purple/lavender highlight background
  - Items: Dashboard, All Visitor (active), Gate Check-In, Gate Check-Out, Reports, Settings

#### Section 3: Main Content Area (right side)
- **Background**: #FAF8F5
- **Content Container**:
  - Position: left 298px (sidebar width + margin), top varies
  - Width: 1118px
  - Padding: 24px
  
- **Title Bar** (top section):
  - Title: "All Visitors" (24px, Inter Semi Bold, #171717)
  - Button: "Add Visitor" (purple #5B21B6, padding 16px x 11px, rounded 8px, text white)
  - Layout: flex, space-between
  - Top position: 107px from page top
  
- **Subtitle**: "List of all Visitors" (16px, Inter Medium, #171717)

- **Search/Filter Bar**:
  - Search input box: white background, border #E2E2E2, placeholder text
  - Filter button: next to search
  
- **Table Container**:
  - Position: absolute, top 164px (below subtitle/search)
  - White background, rounded 16px, shadow 0px 2px 6px rgba(0,0,0,0.12)
  - Width: 1118px
  - Height: 846px
  
- **Table Header Row**:
  - Background: #F6F6F6
  - Border-bottom: #BABABA
  - Padding: 10px vertical, 8px horizontal per cell
  - Columns (in order) with exact widths:
    - Name: 124px
    - Company: 120px
    - Host: 115px
    - Purpose: 131px
    - Check-in Time: 135px
    - Check-out Time: 118px
    - Status: 128px
    - Badge: 97px
    - Action: remaining width
  - Font: 12px, Inter Semi Bold, color #727272
  
- **Table Data Rows** (10 visible rows):
  - Sample visitor data (Mathew/Amazon/Arun Kumar/Meeting/13:25/-/Check in/QR Generated/Eye+Edit icons)
  - Row height: ~45px with content and padding
  - Alternating background (white) with subtle hover effect
  - Avatar images: circular, 32x32px, left side of Name cell
  
- **Pagination Footer**:
  - Position: bottom of table
  - Text: "Show 10 of 32 Records"
  - Page numbers: 1 (active, purple), 2, 3, 4, next arrow
  - Pagination controls on right
  
- **Page Footer**:
  - Background: white
  - Border-top: #E2E2E2
  - Text: "Copyright 2026 Changepond. All Rights Reserved." (12px, Poppins, centered)
  - Position: bottom of page, full width
  - Height: 46px

#### Color & Style Summary per Element
1. **Purple Button** (#5B21B6): "Add Visitor" button with white text
2. **Status Badges**: 
   - Check in (green background, green/white text)
   - Waiting (orange background)
   - Checked Out (purple background)
   - Expired Pass (red background)
   - Pending Approval (orange background)
3. **Icons**: Vuesax linear style, 20x20px or as specified
4. **Shadows**: Subtle on white cards (0px 2px 6px rgba(0,0,0,0.12))
5. **Borders**: Mostly light gray #E2E2E2, darker #BABABA for separators

---

## Implementation Notes for Frontend Developer

1. **Image Assets**: All image URLs are Figma-hosted signed URLs (valid for 7 days):
   - Logo SVG: `https://www.figma.com/api/mcp/asset/...`
   - Avatar images: `https://www.figma.com/api/mcp/asset/...`
   - Icons (Filter, Eye, Edit, Expand More, Dashboard, etc.): All use Vuesax linear style
   
2. **Typography Implementation**:
   - Use CSS font-face or Google Fonts for Inter family (weights 400, 500, 600)
   - Fallback to Poppins for footer, system sans-serif as final fallback
   
3. **Responsive Behavior**:
   - Sidebar: Fixed 274px on desktop, collapse on mobile
   - Main content: Fluid, adjust table column widths proportionally on smaller screens
   - Table columns may stack on mobile view (consider horizontal scroll or grid layout)
   
4. **Interactivity**:
   - Sidebar items: Click to navigate, highlight active page
   - Search box: Debounced input, trigger filter on 200ms idle
   - Filter button: Opens filter panel (design not provided, recommend dropdown or modal)
   - Table rows: Click for detail view, edit icon opens edit modal
   - Pagination: Click page numbers to fetch new page of data
   - Status badges: Tooltips on hover showing full status text
   
5. **State Management**:
   - Current page (active in sidebar): "All Visitor"
   - Visitor list: Should be fetched from backend API (GET /api/visitors?page=1&limit=10)
   - Logged-in user: "John" (shown in greeting, from authentication context)
   - Loading states: Show skeleton/shimmer while fetching data
   - Empty state: If no visitors, show "No visitors found" message
   
6. **Accessibility**:
   - Use semantic HTML (table, thead, tbody, etc.)
   - Add aria-labels to icon buttons (eye, edit, filter)
   - Ensure status badges have sufficient color contrast
   - Keyboard navigation for table (arrow keys, enter to open detail)
   - WCAG 2.1 AA compliance recommended
