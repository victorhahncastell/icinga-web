<?php

class AppKitArrayUtil {
	
	public static function arrayKeyInsertBefore(array $input, $before, array $insert) {
		$new = array ();
		$old = $input;
		
		foreach ($old as $key=>$val) {
			if ($key == $before) {
				foreach ($insert as $iKey=>$iVal) {
					$new[$iKey] = $iVal;
				}
			}
			$new[$key] = $val;
		}
		return $new;
	}
	
	public static function searchKeyRecursive($needle, array $haystack) {
		$out = false;
		foreach ($haystack as $key=>$val) {
			if ($key == $needle) {
				$out = true;
				break;
			}
			elseif (is_array($val)) {
				$out = self::searchKeyRecursive($needle, $val);
			}
			elseif ($out == true) {
				break;
			}
		}
		return $out;
	}

	/**
	 * Flatten an recursive tree structure
	 *
	 * @param array $data
	 * @param string $key_prefix
	 * @param array $dump
	 * @return array
	 */
	public static function flattenArray(array &$data, $key_prefix='', array &$dump = array ()) {
		foreach ($data as $k=>$v) {
			if (is_array($v)) {
				self::flattenArray($v, $key_prefix. '.'. $k, $dump);
			}
			else {
				$dump[$key_prefix. '.'. $k] = $v;
			}
		}

		return $dump;
	}
	
}

?>
