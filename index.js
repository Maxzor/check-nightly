/**
 * This file is licensed under the MIT License.
 *
 * Some code taken from https://github.com/actions/upload-release-asset
 */

const core = require("@actions/core");
const { GitHub } = require("@actions/github");
const fs = require("fs");

/**
 *
 * @param {GitHub} github
 * @param {*} name
 */


async function run() {
	try {
		const maxReleases = parseInt(core.getInput("max_releases", { required: false }));
		const releaseId = core.getInput("release_id", { required: true });
		let name = core.getInput("asset_name", { required: true });
		const placeholderStart = name.indexOf("$$");
		const nameStart = name.substr(0, placeholderStart);
		const nameEnd = name.substr(placeholderStart + 2);
		core.info(name + " " + nameStart + " " + nameEnd);

		const github = new GitHub(process.env.GITHUB_TOKEN);
		const hash = process.env.GITHUB_SHA.substr(0, 6);
		const repository = process.env.GITHUB_REPOSITORY.split('/');
		const owner = repository[0];
		const repo = repository[1];
        const run_id = process.env.GITHUB_RUN_ID;

		core.info("Checking previous assets");
		let assets = await github.repos.listAssetsForRelease({
			owner: owner,
			repo: repo,
			release_id: parseInt(releaseId),
			per_page: 100
		});

		let existingAssetNameId = undefined;

		let numFound = 0;
		for (let i = 0; i < assets.data.length; i++) {
			const asset = assets.data[i];
			//core.info(numFound + ":" + asset.name);
			if (asset.name == name) {
				// not commit hash or date in filename, always force upload here
				existingAssetNameId = asset.id;
			}
			else if (asset.name.startsWith(nameStart) && asset.name.endsWith(nameEnd)) {
				if (asset.name.endsWith("-" + hash + nameEnd)) {
					core.info("Current commit already released, exiting");
					const res = await octokit.actions.cancelWorkflowRun({
					  owner,
					  repo,
					  run_id
					});
					core.setOutput("cancelled", "yes");
					return;
				}
			}
		}

	}
	catch (error) {
		core.setFailed(error.message);
	}
}

run();
