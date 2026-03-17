irm https://raw.githubusercontent.com/Gentleman-Programming/gentle-ai/main/scripts/install.ps1 | iex



   ____            _   _              _    ___
  / ___| ___ _ __ | |_| | ___        / \  |_ _|
 | |  _ / _ \ '_ \| __| |/ _ \_____ / _ \  | |
 | |_| |  __/ | | | |_| |  __/_____/ ___ \ | |
  \____|\___|_| |_|\__|_|\___|    /_/   \_\___|

  One command to configure any AI coding agent on any OS


==> Detecting platform
[ok]      Platform: Windows (amd64)

==> Checking prerequisites
[ok]      curl and git are available

==> Detecting best install method
[info]    Will download pre-built binary from GitHub Releases

==> Installing pre-built binary
[info]    Fetching latest release from GitHub...
[ok]      Latest version: v1.7.3
[info]    Downloading gentle-ai_1.7.3_windows_amd64.zip...
[ok]      Downloaded gentle-ai_1.7.3_windows_amd64.zip (3028595 bytes)
[info]    Verifying checksum...
[ok]      Checksum verified
[info]    Extracting gentle-ai...
[info]    Installing to C:\Users\brian\AppData\Local\gentle-ai\bin\gentle-ai.exe...
[ok]      Installed gentle-ai to C:\Users\brian\AppData\Local\gentle-ai\bin\gentle-ai.exe


luego me dice que haga esto para que se active siempre

[warn]    C:\Users\brian\AppData\Local\gentle-ai\bin is not in your PATH

[warn]    Run this to add it permanently:

[Environment]::SetEnvironmentVariable('PATH', $env:PATH + ';C:\Users\brian\AppData\Local\gentle-ai\bin', 'User')


==> Verifying installation
[ok]      Found gentle-ai at C:\Users\brian\AppData\Local\gentle-ai\bin\gentle-ai.exe: gentle-ai 1.7.3
[warn]    Binary location is not in your PATH. Add it to use 'gentle-ai' directly.

Installation complete!
