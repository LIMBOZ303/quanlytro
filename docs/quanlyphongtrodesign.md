---
name: Modern Boarding Management
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#444651'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#4b1c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#6e2c00'
  on-tertiary-container: '#f39461'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#ffdbcb'
  tertiary-fixed-dim: '#ffb691'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#773205'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-sm:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Manrope
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-bold:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
  status-pill:
    fontFamily: Manrope
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  container-padding: 24px
  gutter: 16px
  card-gap: 20px
  sidebar-width: 260px
---

## Brand & Style

The design system is engineered for landlords and property managers who require a high-utility, professional interface to manage residential assets. The personality is **Efficient, Authoritative, and Transparent**. 

The visual style follows a **Modern Corporate** aesthetic with a lean toward **Minimalism**. It prioritizes data density and legibility over decorative elements. Key characteristics include:
- **High Information Density:** Utilizing grid-based layouts to show complex financial and occupancy data at a glance.
- **Functional Color Coding:** Using color strictly for status and action, rather than decoration.
- **Subtle Depth:** Using tonal layering and soft shadows to separate the navigation, content area, and modal dialogues without creating visual clutter.

## Colors

The palette is anchored by a **Deep Indigo (#1E3A8A)** as the primary color to evoke trust and stability. 

### Status Semantics
Color is the primary vehicle for status communication:
- **Trống (Available):** Emerald Green (#10B981) - Represents opportunity and readiness.
- **Đã thuê (Rented):** Blue (#3B82F6) - Represents active, stable management.
- **Quá hạn (Overdue):** Red (#EF4444) - Indicates urgent financial attention required.
- **Chưa thanh toán (Unpaid):** Amber (#F59E0B) - Indicates a pending task that is not yet critical.

### Application
Use the `canvas` background for the main application area to allow white `surface` cards to pop. Interactive elements should exclusively use the primary and secondary blue scales.

## Typography

The design system utilizes **Manrope** for its exceptional legibility in data-heavy environments and modern geometric construction. 

- **Hierarchy:** Use `display-lg` only for page titles (e.g., "Tổng quan").
- **Data Grids:** Use `body-sm` for table row content to maximize information density without sacrificing readability.
- **Vietnamese Support:** Manrope provides full diacritic support, ensuring that labels like "Tính tiền phòng" or "Khách thuê" remain balanced and professional.
- **Numeric Data:** Ensure tabular figures (monospaced numbers) are used for "Giá thuê" and "Chỉ số điện/nước" to allow easy vertical comparison in lists.

## Layout & Spacing

This design system uses a **Fixed-Fluid Hybrid Grid**. 
- **Sidebar:** A fixed 260px sidebar for primary navigation.
- **Main Content:** A fluid area with a max-width of 1440px for desktop to prevent line lengths from becoming unreadable.
- **Grid System:** 12-column grid for the dashboard. Cards typically span 3 columns for metrics (4 per row) or 6-12 columns for tables and forms.

### Breakpoints
- **Desktop (1024px+):** Sidebar visible, 24px margins.
- **Tablet (768px - 1023px):** Sidebar collapses to icons or a hamburger menu. Margins reduce to 16px.
- **Mobile (<767px):** Single column layout. Tables must transition to "card stacks" for readability.

## Elevation & Depth

The design system uses **Tonal Layering** supplemented by **Soft Ambient Shadows**.

- **Level 0 (Canvas):** The base background (#F8FAFC).
- **Level 1 (Cards/Sidebar):** Pure white surfaces with a very soft, diffused shadow (0px 2px 4px rgba(0,0,0,0.05)). This is where 90% of user interaction happens.
- **Level 2 (Modals/Popovers):** Elevated surfaces used for adding new rooms or calculating bills. These use a more pronounced shadow (0px 10px 25px rgba(0,0,0,0.1)) and a background backdrop blur (8px) to focus the user's attention.
- **Borders:** Use a 1px solid border (#E2E8F0) for card containers to provide definition on high-brightness displays.

## Shapes

The design system employs a **Rounded (8px)** corner strategy to soften the professional interface and make it feel modern and approachable.

- **Standard Elements:** Buttons, Input fields, and Cards use the `0.5rem (8px)` radius.
- **Small Elements:** Status badges (Pills) and Checkboxes use `rounded-lg (16px)` or full pill shapes to distinguish them from structural containers.
- **Modals:** Use `rounded-xl (24px)` to emphasize their role as temporary, high-level overlays.

## Components

### Buttons
- **Primary:** Solid Indigo (#1E3A8A) with white text. Used for "Thêm Phòng", "Lưu & Tính tiền".
- **Secondary:** Light blue tint background with Primary text. Used for "Xuất hóa đơn".
- **Ghost:** No background, neutral text. Used for "Hủy" or "Quay lại".

### Input Fields
- **Default State:** White background, 1px border (#CBD5E1), 8px roundedness.
- **Labeling:** Vietnamese labels must be placed *above* the field using `label-bold`.
- **Validation:** Error states must use the Overdue color (#EF4444) for both the border and a small helper text below.

### Data Tables (Danh sách)
- **Header:** Light grey background (#F1F5F9) with `label-bold` text.
- **Rows:** Alternating subtle zebra striping or hover states (Light Blue tint) to help the user track data across long rows.
- **Actions:** Use icon-only buttons for "Edit" (Blue) and "Delete" (Red) at the end of rows to save horizontal space.

### Status Badges (Nhãn trạng thái)
- Small, pill-shaped badges with low-opacity background of the status color and high-opacity text of the same color. For example, "Trống" has a light emerald background and dark emerald text.

### Metrics Cards
- Used in "Tổng quan" (Overview). Features a large `title-sm` icon on the left, a `body-sm` label, and a `headline-md` numeric value.