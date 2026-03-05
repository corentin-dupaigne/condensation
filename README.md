# Condensation

## Team Members & Responsibilities

* **Corentin Dupaigne:** Responsible for infrastructure (`/infra`) and the authentication service (`/authentication`).
* **Jules Ladaigue:** Responsible for the Java backend services (`/backend`).
* **Nhat Linh Nguyen:** Responsible for the frontend application (`/frontend`).
* **Adrien Deu:** Assisting with the frontend application (`/frontend`).

## Project Structure

The repository is structured into the following main directories:

* **`/authentication`**: Contains the Laravel microservice responsible for OAuth2 with PKCE authentication flow.
* **`/backend`**: Contains the main Java backend services components (Marketplace, Catalog, etc.).
* **`/docs`**: Contains all project documentation, including the design document, agile epics, user stories, and sprint planning.
* **`/frontend`**: Contains the Next.js frontend application.
* **`/infra`**: Contains the Infrastructure as Code (IaC) configurations, including Terraform, Ansible, and Docker/Kubernetes setups.

## Documentation

Comprehensive documentation about the platform's architecture and the Agile planning can be found in the `docs` directory:

* **Design Document:** An overview of the functional vision, user profiles, software architecture, and DevOps platform is available in [`docs/design-document.md`](./docs/design-document.md).
* **Agile Epics & Sprint Planning:** All Epics, User Stories, and Sprint roadmaps can be found within the [`docs/agile/`](./docs/agile/) directory. Specifically, refer to [`docs/agile/sprint-planning.md`](./docs/agile/sprint-planning.md) for the timeline and sprint goals.
