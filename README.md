<div align="center">

  <img src="assets/logo.png" alt="logo" width="200" height="auto" />
  <h1>Scout</h1>

  <p>
    CLI for looking up domains, phone numbers, etc.
  </p>

</div>

<!-- About the Project -->
## :star2: About the Project

OSINT CLI for doing recon on a domain, phone number, etc. Provides either pretty print or JSON for scripting or quick one-off usage. More to come. Vibe-code free.

<!-- Features -->
## :dart: Features

- Domain lookups: registration and expiry dates, nameservers, IP, mail server, SPF, and verified services
- Phone lookups: validity, country, line type, and formatted versions of the number
- Pretty print or JSON output

<!-- Installation -->
## :gear: Installation

```bash
git clone https://github.com/Connor-Valley/scout.git
cd scout
npm install
npm run build
npm link
```

<!-- Usage -->
## :eyes: Usage

```bash
scout -d google.com
scout -p "+1 (248) 555-0142"
scout -d google.com --json
scout --help
```