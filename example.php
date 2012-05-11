<?php

	define("GIT_REPO_PATH", "/path/to/your/repo"); //set the path to your repo here

	$repo_dir = getenv('GIT_DIR');
	if (empty($repo_dir)) {
		chdir(GIT_REPO_PATH);
		$repo_dir = GIT_REPO_PATH;
	}
	$repo_name = basename($repo_dir);

	$cmd = 'git log --graph --date-order --all -C -M -n 100 --date=iso --pretty=format:"B[%d] C[%H] D[%ad] A[%an] E[%ae] H[%h] S[%s]"';

	@ob_clean();
	ob_start();
	passthru($cmd . ' 2>&1');
	$o = ob_get_clean();

	$rawRows = explode("\n", $o);
	$graphItems = array();

	foreach ($rawRows as $row) {
		if (preg_match("/^(.+?)(\s(B\[(.*?)\])? C\[(.+?)\] D\[(.+?)\] A\[(.+?)\] E\[(.+?)\] H\[(.+?)\] S\[(.+?)\])?$/", $row, $output)) {
			if (!isset($output[4])) {
				$graphItems[] = array(
					"relation"=>$output[1]
				);
				continue;
			}
			$graphItems[] = array(
				"relation"=>$output[1],
				"branch"=>$output[4],
				"rev"=>$output[5],
				"date"=>$output[6],
				"author"=>$output[7],
				"author_email"=>$output[8],
				"short_rev"=>$output[9],
				"subject"=>preg_replace('/(^|\s)(#[[:xdigit:]]+)(\s|$)/', '$1<a href="$2">$2</a>$3', $output[10])
			);
		}
	}

	$title = "Git Graph of " . $repo_name;
?>

<!DOCTYPE html>
<html>
	<head>
		<title><?php echo $title; ?></title>
		<meta http-equiv="Content-type" content="text/html; charset=utf-8">
		<script type="text/javascript" src="jquery.js"></script>
		<script type="text/javascript" src="gitgraph.js"></script>
		<script type="text/javascript" src="draw.js"></script>
		<link href="gitgraph.css" rel="stylesheet" type="text/css">
	</head>

	<body>
		<div id="header">
			<h2>
				<?php echo $title; ?>
			</h2>
		</div>
		<div id="git-graph-container">
		<div id="rel-container">
			<canvas id="graph-canvas" width="100px">
				<ul id="graph-raw-list">
					<?php
						foreach ($graphItems as $graphItem) {
							echo "<li><span class=\"node-relation\">" . $graphItem['relation'] . "</span></li>\n";
						}
					?>
				</ul>
			</canvas>
		</div>

		<div style="float:left;" id="rev-container">
			<ul id="rev-list">
				<?php
					foreach ($graphItems as $graphItem) {
						echo "<li>";
						if (isset($graphItem['rev'])) {
							echo "<code id='".$graphItem['short_rev']."'>".$graphItem['short_rev']."</code> <strong>" . $graphItem['branch'] . "</strong> <em>" . $graphItem['subject'] . "</em> by <span class=\"author\">" . $graphItem['author'] . " &lt;" . $graphItem['author_email'] . "&gt;</span>  <span class=\"time\">" . $graphItem['date'] . "</span>";
						} else {
							echo "<span />";
						}
						echo "</li>";
					}
				?>
			</ul>
		</div>
	</div>
	</body>
</html>
