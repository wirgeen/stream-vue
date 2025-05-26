// == MODULE: stream-vue == //
// Version compatible Foundry VTT v13

Hooks.once("init", () => {
	console.log("StreamVue | Initialisation du module");
	StreamVue.init();
});

Hooks.once("ready", () => {});

const StreamVue = {
	selectedMode: "group",
	selectedPlayer: null,
	streamWindow: null,
	interval: null,

	init() {
		this.createControlButton();
		game.socket.on("module.stream-vue", this.handleSocket.bind(this));
	},

	createControlButton() {
		Hooks.on("getSceneControlButtons", (controls) => {
			controls.push({
				name: "stream-vue",
				title: "Stream Vue",
				icon: "fas fa-video",
				layer: "tokens",
				tools: [
					{
						name: "select-mode",
						title: "Sélectionner Mode",
						icon: "fas fa-cogs",
						onClick: () => this.showConfigDialog(),
					},
					{
						name: "start-stream",
						title: "Démarrer le Stream",
						icon: "fas fa-play",
						onClick: () => this.startStream(),
					},
					{
						name: "stop-stream",
						title: "Arrêter le Stream",
						icon: "fas fa-stop",
						onClick: () => this.stopStream(),
					},
				],
			});
		});
	},

	showConfigDialog() {
		let players = game.users.players.map((u) => `<option value="${u.id}">${u.name}</option>`).join("");
		let content = `
      <form>
        <div class="form-group">
          <label>Mode de Vue :</label>
          <select id="stream-mode">
            <option value="group">Vue Groupe</option>
            <option value="gm">Vue MJ</option>
            <option value="player">Vue Joueur</option>
          </select>
        </div>
        <div class="form-group">
          <label>Joueur :</label>
          <select id="stream-player">
            ${players}
          </select>
        </div>
      </form>
    `;
		new Dialog({
			title: "Configuration du Stream",
			content,
			buttons: {
				ok: {
					label: "Valider",
					callback: (html) => {
						this.selectedMode = html.find("#stream-mode").val();
						this.selectedPlayer = html.find("#stream-player").val();
					},
				},
			},
		}).render(true);
	},

	startStream() {
		if (this.streamWindow && !this.streamWindow.closed) {
			ui.notifications.warn("Un stream est déjà en cours.");
			return;
		}

		this.streamWindow = window.open("", "StreamVue", "width=1280,height=720");
		this.streamWindow.document.body.innerHTML = "<h2>Chargement du Stream...</h2>";

		this.interval = setInterval(async () => {
			let data = await this.captureView();
			game.socket.emit("module.stream-vue", data);
		}, 1000);

		this.streamWindow.document.body.innerHTML = '<iframe id="stream-frame" width="100%" height="100%"></iframe>';
	},

	stopStream() {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		}
		if (this.streamWindow && !this.streamWindow.closed) {
			this.streamWindow.close();
			this.streamWindow = null;
		}
		ui.notifications.info("Stream arrêté.");
	},

	async captureView() {
		let data = { mode: this.selectedMode, scene: game.scenes.active.id };

		let imgData = canvas.app.renderer.extract.base64();
		data.image = imgData;

		if (this.selectedMode === "player" && this.selectedPlayer) {
			let user = game.users.get(this.selectedPlayer);
			if (user) {
				data.camera = user.viewPosition;
				data.journals = game.journal.directory.entries.filter((j) => j.permission.has(user)).map((j) => j.name);
			}
		} else if (this.selectedMode === "group") {
			let tokens = canvas.tokens.placeables.filter((t) => t.actor.hasPlayerOwner);
			let bounds = canvas.tokens.getBoundingBox(tokens);
			data.bounds = bounds;
		} else if (this.selectedMode === "gm") {
			data.camera = game.viewedScene;
			data.noNotes = true;
		}

		return data;
	},

	handleSocket(data) {
		if (!this.streamWindow || this.streamWindow.closed) return;
		let frame = this.streamWindow.document.getElementById("stream-frame");
		if (!frame) return;

		let doc = frame.contentDocument || frame.contentWindow.document;

		let html = `
      <style>
        body { font-family: sans-serif; background: #111; color: #eee; padding: 1em; }
        h2 { margin-top: 0; color: #0f0; }
        .section { margin-bottom: 1em; border-bottom: 1px solid #444; padding-bottom: 0.5em; }
        .section:last-child { border-bottom: none; }
        .tokens, .journals { display: flex; flex-wrap: wrap; gap: 0.5em; }
        .token, .journal { background: #333; padding: 0.3em 0.6em; border-radius: 4px; }
      </style>

      <h2>StreamVue (${data.mode})</h2>

      <div class="section">
        <strong>Scène :</strong> ${data.scene || "N/A"}
      </div>
    `;

		if (data.camera) {
			html += `
        <div class="section">
          <strong>Caméra :</strong>
          <pre>${JSON.stringify(data.camera, null, 2)}</pre>
        </div>
      `;
		}

		if (data.bounds) {
			html += `
        <div class="section">
          <strong>Vue de groupe (bounds) :</strong>
          <pre>${JSON.stringify(data.bounds, null, 2)}</pre>
        </div>
      `;
		}

		if (data.journals && data.journals.length) {
			html += `
        <div class="section">
          <strong>Journaux ouverts :</strong>
          <div class="journals">
            ${data.journals.map((j) => `<div class="journal">${j}</div>`).join("")}
          </div>
        </div>
      `;
		}

		if (data.image) {
			html += `
        <div class="section">
          <strong>Vue actuelle :</strong><br>
          <img src="${data.image}" style="max-width:100%; border:1px solid #555; border-radius:4px;">
        </div>
      `;
		}

		doc.body.innerHTML = html;
	},
};
