# Company Data Table

A modern, high-performance editable data table application built with **Next.js 14+**, **Tailwind CSS**, and **Shadcn/UI**. This application mimics spreadsheet-like functionality with a focus on ease of use and visual appeal.

## Features

### 📊 Dynamic Data Table
-   **Flexible Structure**: Easily add, remove, and reorder rows and columns.
-   **Rich Column Types**:
    -   **Text**: Standard input fields.
    -   **Select / Multi-Select**: Dropdowns with customizable options and color coding.
    -   **Date**: Date pickers for temporal data.
    -   **Price**: Currency inputs.
    -   **File / Image**: Upload and preview support.
    -   **Icon**: Visual indicators.
-   **Resizing**:
    -   **Column Width**: Drag column headers to resize.
    -   **Row Height**: Drag row indices to adjust global row height.

### 📑 Sheet Management
-   **Multiple Sheets**: Organize data across multiple tabs.
-   **Drag & Drop**: Reorder sheets effortlessly using `@dnd-kit`.
-   **Customization**: Rename tabs and assign custom identification colors.

### 💾 Templates
-   **Save & Load**: Save table structures as templates for quick reuse.
-   **Default Templates**: Includes pre-configured templates for common use cases.

### 🎨 UI/UX
-   **Modern Design**: Clean, minimal interface using **Shadcn/UI** components.
-   **Dark Mode**: Fully supported dark theme.
-   **Responsive**: Full-height application layout.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Components**: [Shadcn/UI](https://ui.shadcn.com/) (Radix UI)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Drag & Drop**: [@dnd-kit](https://dndkit.com/)

## Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/murat-cakmak/companyTable.git
    cd companyTable
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

4.  **Open the app**:
    Navigate to [http://localhost:3000](http://localhost:3000).

## Project Structure

-   `/app`: Next.js App Router pages and layouts.
-   `/components`: React components (ui, table, etc.).
-   `/lib`: Utility functions and constants.
-   `/types`: TypeScript type definitions.

