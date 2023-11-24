# DO NOT CHANGE THIS FILE

with import <nixpkgs> { };
stdenv.mkDerivation {
  name = "env";
  nativeBuildInputs = [ pkg-config ];
  buildInputs = [ ];
	
  shellHook = ''
    LD=$CC

		nix-shell run.nix
  '';
}
