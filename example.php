<?php
	define("GIT_REPO_PATH", "/path/to/your/repo"); //set the path to your repo here
	
	chdir(GIT_REPO_PATH);
	
	$cmd = 'git log --graph --date-order -C -M -n 100 --date=iso --pretty=format:"B[%d] C[%H] D[%ad] A[%an] E[%ae] S[%s]"';
	
	ob_clean();
	ob_start();
	passthru($cmd . ' 2>&1');
	$o = ob_get_contents();
	ob_end_clean();
	
	$rawRows = explode("\n", $o);
	$graphItems = array();
	
	foreach ($rawRows as $row) {
		preg_match("/^(.+?)(\s(B\[(.*?)\])? C\[(.+?)\] D\[(.+?)\] A\[(.+?)\] E\[(.+?)\] S\[(.+?)\])?$/", $row, $output);
		
		$graphItems[] = array(
			"relation"=>$output[1], 
			"branch"=>$output[4],
			"rev"=>$output[5],
			"date"=>$output[6],
			"author"=>$output[7],
			"author_email"=>$output[8],
			"subject"=>$output[9]
		);
	}
	
	$title = "Git Graph of " . substr(GIT_REPO_PATH, strrpos(GIT_REPO_PATH, "/") + 1);
?>

<!DOCTYPE html>
<html>
	<head>
		<title><?php echo $title; ?></title>
		<meta http-equiv="Content-type" content="text/html; charset=utf-8">
		<script type="text/javascript" src="jquery.js"></script>
		<script type="text/javascript" src="gitgraph.js"></script>
		<script type="text/javascript" src="chart.js"></script>
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
						if ($graphItem['rev']) {
							echo "<strong>" . $graphItem['branch'] . "</strong> <em>" . $graphItem['subject'] . "</em> by <span class=\"author\">" . $graphItem['author'] . " &lt;" . $graphItem['author_email'] . "&gt;</span>  <span class=\"time\">" . $graphItem['date'] . "</span>";
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