import { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import { BaseWindowProps } from "@/types";
import { getMaximizedSize } from "@/utils/windowHelpers";
import {
  IoPlaySharp,
  IoPauseSharp,
  IoPlaySkipForwardSharp,
  IoPlaySkipBackSharp,
} from "react-icons/io5";
import { HiOutlineHeart, HiHeart } from "react-icons/hi2";
import { MdShuffle, MdRepeat } from "react-icons/md";
import { FiVolume2, FiSearch } from "react-icons/fi";
import { AiOutlinePlus } from "react-icons/ai";
import { BiLibrary } from "react-icons/bi";
import { GoHome } from "react-icons/go";
import styles from "./spotify.module.css";

interface SpotifyProps extends BaseWindowProps {}

interface SpotifyPlaylist {
  id: string;
  name: string;
  images: { url: string }[];
  tracks: { total: number };
  owner: { display_name: string };
}

interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  duration_ms: number;
}

interface CurrentlyPlaying {
  item: SpotifyTrack;
  is_playing: boolean;
  progress_ms: number;
}

export default function Spotify({
  defaultPosition,
  hideTopbarAndDock,
  onClose,
}: SpotifyProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [size, setSize] = useState({ width: 1200, height: 800 });
  const [position, setPosition] = useState(defaultPosition);

  // Spotify state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] =
    useState<SpotifyPlaylist | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<SpotifyTrack[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] =
    useState<CurrentlyPlaying | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeView, setActiveView] = useState<"library" | "search">("library");

  const CLIENT_ID = "70e3b8fddc704d4f83fc673afcac3870";
  const REDIRECT_URI =
    typeof window !== "undefined"
      ? ["localhost", "127.0.0.1"].includes(window.location.hostname)
        ? "http://127.0.0.1:3000"
        : window.location.origin
      : "";
  const SCOPES = [
    "user-read-private",
    "user-read-email",
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "playlist-read-private",
    "playlist-read-collaborative",
    "user-library-read",
  ].join(" ");

  // PKCE Helper Functions
  const generateRandomString = (length: number) => {
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
  };

  const sha256 = async (plain: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest("SHA-256", data);
  };

  const base64encode = (input: ArrayBuffer) => {
    return btoa(String.fromCharCode(...Array.from(new Uint8Array(input))))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  };

  useEffect(() => {
    // Check for authorization code in URL (from OAuth callback)
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      // Exchange code for token
      exchangeCodeForToken(code);
    } else {
      // Check for stored token
      const storedToken = localStorage.getItem("spotify_access_token");
      if (storedToken) {
        setAccessToken(storedToken);
        setIsAuthenticated(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchUserPlaylists();
      fetchCurrentlyPlaying();

      // Poll currently playing every 5 seconds
      const interval = setInterval(fetchCurrentlyPlaying, 5000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken]);

  const handleLogin = async () => {
    const codeVerifier = generateRandomString(64);
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);

    // Store code verifier for later use
    localStorage.setItem("spotify_code_verifier", codeVerifier);

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&scope=${encodeURIComponent(
      SCOPES
    )}&response_type=code&code_challenge_method=S256&code_challenge=${codeChallenge}`;
    window.location.href = authUrl;
  };

  const exchangeCodeForToken = async (code: string) => {
    const codeVerifier = localStorage.getItem("spotify_code_verifier");

    if (!codeVerifier) {
      console.error("No code verifier found");
      return;
    }

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    });

    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (response.ok) {
        const data = await response.json();
        setAccessToken(data.access_token);
        setIsAuthenticated(true);
        localStorage.setItem("spotify_access_token", data.access_token);
        localStorage.removeItem("spotify_code_verifier");

        // Clean up URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } else {
        console.error("Failed to exchange code for token");
      }
    } catch (error) {
      console.error("Error exchanging code for token:", error);
    }
  };

  const fetchUserPlaylists = async () => {
    try {
      const response = await fetch(
        "https://api.spotify.com/v1/me/playlists?limit=50",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPlaylists(data.items);
        if (data.items.length > 0) {
          setSelectedPlaylist(data.items[0]);
          fetchPlaylistTracks(data.items[0].id);
        }
      } else if (response.status === 401) {
        // Token expired
        handleLogout();
      }
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  };

  const fetchPlaylistTracks = async (playlistId: string) => {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPlaylistTracks(data.items.map((item: any) => item.track));
      }
    } catch (error) {
      console.error("Error fetching playlist tracks:", error);
    }
  };

  const fetchCurrentlyPlaying = async () => {
    try {
      const response = await fetch(
        "https://api.spotify.com/v1/me/player/currently-playing",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok && response.status !== 204) {
        const data = await response.json();
        setCurrentlyPlaying(data);
        setIsPlaying(data.is_playing);
      }
    } catch (error) {
      console.error("Error fetching currently playing:", error);
    }
  };

  const handlePlaylistClick = (playlist: SpotifyPlaylist) => {
    setSelectedPlaylist(playlist);
    fetchPlaylistTracks(playlist.id);
    setActiveView("library");
  };

  const handleLogout = () => {
    localStorage.removeItem("spotify_access_token");
    setAccessToken(null);
    setIsAuthenticated(false);
    setPlaylists([]);
    setSelectedPlaylist(null);
    setPlaylistTracks([]);
    setCurrentlyPlaying(null);
  };

  // Search function
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          query
        )}&type=track&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.tracks.items);
      }
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(query);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  // Playback controls
  const playTrack = async (trackUri: string) => {
    try {
      const response = await fetch(
        "https://api.spotify.com/v1/me/player/play",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uris: [trackUri],
          }),
        }
      );

      if (response.ok || response.status === 204) {
        setTimeout(fetchCurrentlyPlaying, 500);
      } else if (response.status === 404) {
        alert(
          "No active device found. Please open Spotify on a device and start playing something first."
        );
      }
    } catch (error) {
      console.error("Error playing track:", error);
    }
  };

  const togglePlayPause = async () => {
    try {
      const endpoint = isPlaying
        ? "https://api.spotify.com/v1/me/player/pause"
        : "https://api.spotify.com/v1/me/player/play";

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok || response.status === 204) {
        setIsPlaying(!isPlaying);
        setTimeout(fetchCurrentlyPlaying, 500);
      }
    } catch (error) {
      console.error("Error toggling play/pause:", error);
    }
  };

  const skipToNext = async () => {
    try {
      const response = await fetch(
        "https://api.spotify.com/v1/me/player/next",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok || response.status === 204) {
        setTimeout(fetchCurrentlyPlaying, 500);
      }
    } catch (error) {
      console.error("Error skipping to next:", error);
    }
  };

  const skipToPrevious = async () => {
    try {
      const response = await fetch(
        "https://api.spotify.com/v1/me/player/previous",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok || response.status === 204) {
        setTimeout(fetchCurrentlyPlaying, 500);
      }
    } catch (error) {
      console.error("Error skipping to previous:", error);
    }
  };

  const toggleMaximize = () => {
    if (isMaximized) {
      hideTopbarAndDock(false);
      setSize({ width: 1200, height: 800 });
      setPosition(defaultPosition);
    } else {
      hideTopbarAndDock(true);
      setSize(getMaximizedSize());
      setPosition({ x: 0, y: 0 });
    }
    setIsMaximized(!isMaximized);
  };

  const handleClose = () => {
    if (isMaximized) {
      hideTopbarAndDock(false);
    }
    onClose();
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Rnd
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      bounds="parent"
      enableResizing={{
        top: false,
        right: true,
        bottom: true,
        left: false,
        topRight: false,
        bottomRight: true,
        bottomLeft: false,
        topLeft: false,
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        setSize({
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
        });
      }}
      onDragStop={(e, d) => {
        setPosition({ x: d.x, y: d.y });
      }}
      dragHandleClassName="draggableHandle"
    >
      <div className={styles.window}>
        <div className={`${styles.windowHeader} draggableHandle`}>
          <div className={styles.windowButtons}>
            <button
              className={styles.closeButton}
              onClick={handleClose}
            ></button>
            <button className={styles.minimizeButton}></button>
            <button
              className={styles.maximizeButton}
              onClick={toggleMaximize}
            ></button>
          </div>
          <div className={styles.windowTitle}>Spotify</div>
        </div>

        <div className={styles.windowContent}>
          {!isAuthenticated ? (
            <div className={styles.loginScreen}>
              <img
                src="/icons/spotify.png"
                alt="Spotify"
                className={styles.loginLogo}
              />
              <h1>Connect to Spotify</h1>
              <p>Log in to see your playlists and currently playing tracks</p>
              <button className={styles.loginButton} onClick={handleLogin}>
                Log in with Spotify
              </button>
            </div>
          ) : (
            <div className={styles.spotifyContent}>
              {/* Sidebar */}
              <div className={styles.sidebar}>
                <div className={styles.sidebarNav}>
                  <button
                    className={styles.navItem}
                    onClick={() => setActiveView("library")}
                  >
                    <GoHome className={styles.navIcon} />
                    Home
                  </button>
                  <button
                    className={`${styles.navItem} ${
                      activeView === "search" ? styles.active : ""
                    }`}
                    onClick={() => setActiveView("search")}
                  >
                    <FiSearch className={styles.navIcon} />
                    Search
                  </button>
                  <button
                    className={`${styles.navItem} ${
                      activeView === "library" ? styles.active : ""
                    }`}
                    onClick={() => setActiveView("library")}
                  >
                    <BiLibrary className={styles.navIcon} />
                    Your Library
                  </button>
                </div>

                <div className={styles.playlistSection}>
                  <div className={styles.playlistHeader}>
                    <h3>Playlists</h3>
                    <button className={styles.addButton}>
                      <AiOutlinePlus />
                    </button>
                  </div>
                  <div className={styles.playlistList}>
                    {playlists.map((playlist) => (
                      <div
                        key={playlist.id}
                        className={`${styles.playlistItem} ${
                          selectedPlaylist?.id === playlist.id
                            ? styles.activePlaylist
                            : ""
                        }`}
                        onClick={() => handlePlaylistClick(playlist)}
                      >
                        <img
                          src={playlist.images[0]?.url || "/icons/spotify.png"}
                          alt={playlist.name}
                          className={styles.playlistImage}
                        />
                        <div className={styles.playlistInfo}>
                          <div className={styles.playlistName}>
                            {playlist.name}
                          </div>
                          <div className={styles.playlistMeta}>
                            Playlist • {playlist.owner.display_name}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className={styles.mainContent}>
                {activeView === "search" ? (
                  <>
                    <div className={styles.searchSection}>
                      <h1 className={styles.searchTitle}>Search</h1>
                      <div className={styles.searchInputContainer}>
                        <FiSearch className={styles.searchIcon} />
                        <input
                          type="text"
                          className={styles.searchInput}
                          placeholder="What do you want to play?"
                          value={searchQuery}
                          onChange={handleSearchInput}
                        />
                      </div>
                    </div>

                    {searchResults.length > 0 && (
                      <div className={styles.trackList}>
                        <div className={styles.trackHeader}>
                          <div className={styles.trackNumber}>#</div>
                          <div className={styles.trackTitle}>Title</div>
                          <div className={styles.trackAlbum}>Album</div>
                          <div className={styles.trackDuration}>⏱</div>
                        </div>
                        {searchResults.map((track, index) => (
                          <div
                            key={track.id}
                            className={styles.trackRow}
                            onClick={() => playTrack(track.uri)}
                          >
                            <div className={styles.trackNumber}>
                              <IoPlaySharp className={styles.playIcon} />
                            </div>
                            <div className={styles.trackInfo}>
                              <img
                                src={track.album.images[0]?.url}
                                alt={track.name}
                                className={styles.trackImage}
                              />
                              <div className={styles.trackTextContainer}>
                                <div className={styles.trackName}>
                                  {track.name}
                                </div>
                                <div className={styles.trackArtist}>
                                  {track.artists.map((a) => a.name).join(", ")}
                                </div>
                              </div>
                            </div>
                            <div className={styles.trackAlbum}>
                              {track.album.name}
                            </div>
                            <div className={styles.trackDuration}>
                              {formatDuration(track.duration_ms)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {isSearching && (
                      <div className={styles.searchLoading}>Searching...</div>
                    )}

                    {searchQuery &&
                      searchResults.length === 0 &&
                      !isSearching && (
                        <div className={styles.noResults}>
                          No results found for &ldquo;{searchQuery}&rdquo;
                        </div>
                      )}
                  </>
                ) : (
                  selectedPlaylist && (
                    <>
                      <div className={styles.playlistHeader}>
                        <img
                          src={
                            selectedPlaylist.images[0]?.url ||
                            "/icons/spotify.png"
                          }
                          alt={selectedPlaylist.name}
                          className={styles.playlistCover}
                        />
                        <div className={styles.playlistHeaderInfo}>
                          <div className={styles.playlistType}>
                            Public Playlist
                          </div>
                          <h1 className={styles.playlistTitle}>
                            {selectedPlaylist.name}
                          </h1>
                          <div className={styles.playlistStats}>
                            {selectedPlaylist.tracks.total} songs
                          </div>
                        </div>
                      </div>

                      <div className={styles.trackList}>
                        <div className={styles.trackHeader}>
                          <div className={styles.trackNumber}>#</div>
                          <div className={styles.trackTitle}>Title</div>
                          <div className={styles.trackAlbum}>Album</div>
                          <div className={styles.trackDuration}>⏱</div>
                        </div>
                        {playlistTracks.map((track, index) => (
                          <div
                            key={track.id}
                            className={styles.trackRow}
                            onClick={() => playTrack(track.uri)}
                          >
                            <div className={styles.trackNumber}>
                              <span className={styles.trackIndex}>
                                {index + 1}
                              </span>
                              <IoPlaySharp className={styles.playIcon} />
                            </div>
                            <div className={styles.trackInfo}>
                              <img
                                src={track.album.images[0]?.url}
                                alt={track.name}
                                className={styles.trackImage}
                              />
                              <div className={styles.trackTextContainer}>
                                <div className={styles.trackName}>
                                  {track.name}
                                </div>
                                <div className={styles.trackArtist}>
                                  {track.artists.map((a) => a.name).join(", ")}
                                </div>
                              </div>
                            </div>
                            <div className={styles.trackAlbum}>
                              {track.album.name}
                            </div>
                            <div className={styles.trackDuration}>
                              {formatDuration(track.duration_ms)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )
                )}
              </div>
            </div>
          )}

          {/* Player Controls */}
          {isAuthenticated && currentlyPlaying && (
            <div className={styles.playerBar}>
              <div className={styles.playerLeft}>
                <img
                  src={currentlyPlaying.item.album.images[0]?.url}
                  alt={currentlyPlaying.item.name}
                  className={styles.playerImage}
                />
                <div className={styles.playerInfo}>
                  <div className={styles.playerTrack}>
                    {currentlyPlaying.item.name}
                  </div>
                  <div className={styles.playerArtist}>
                    {currentlyPlaying.item.artists
                      .map((a) => a.name)
                      .join(", ")}
                  </div>
                </div>
                <button className={styles.playerHeart}>
                  <HiOutlineHeart />
                </button>
              </div>

              <div className={styles.playerCenter}>
                <div className={styles.playerControls}>
                  <button className={styles.controlButton}>
                    <MdShuffle />
                  </button>
                  <button
                    className={styles.controlButton}
                    onClick={skipToPrevious}
                  >
                    <IoPlaySkipBackSharp />
                  </button>
                  <button
                    className={styles.playButton}
                    onClick={togglePlayPause}
                  >
                    {isPlaying ? <IoPauseSharp /> : <IoPlaySharp />}
                  </button>
                  <button className={styles.controlButton} onClick={skipToNext}>
                    <IoPlaySkipForwardSharp />
                  </button>
                  <button className={styles.controlButton}>
                    <MdRepeat />
                  </button>
                </div>
                <div className={styles.progressBar}>
                  <span className={styles.progressTime}>
                    {formatDuration(currentlyPlaying.progress_ms)}
                  </span>
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${
                          (currentlyPlaying.progress_ms /
                            currentlyPlaying.item.duration_ms) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <span className={styles.progressTime}>
                    {formatDuration(currentlyPlaying.item.duration_ms)}
                  </span>
                </div>
              </div>

              <div className={styles.playerRight}>
                <button className={styles.volumeButton}>
                  <FiVolume2 />
                </button>
                <div className={styles.volumeSlider}>
                  <div className={styles.volumeTrack}>
                    <div
                      className={styles.volumeFill}
                      style={{ width: "70%" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Rnd>
  );
}
