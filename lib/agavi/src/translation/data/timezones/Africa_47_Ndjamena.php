<?php

/**
 * Data file for Africa/Ndjamena timezone, compiled from the olson data.
 *
 * Auto-generated by the phing olson task on 04/29/2009 04:12:07
 *
 * @package    agavi
 * @subpackage translation
 *
 * @copyright  Authors
 * @copyright  The Agavi Project
 *
 * @since      0.11.0
 *
 * @version    $Id: Africa_47_Ndjamena.php 4045 2009-04-29 04:14:08Z david $
 */

return array (
  'types' => 
  array (
    0 => 
    array (
      'rawOffset' => 3600,
      'dstOffset' => 0,
      'name' => 'WAT',
    ),
    1 => 
    array (
      'rawOffset' => 3600,
      'dstOffset' => 3600,
      'name' => 'WAST',
    ),
  ),
  'rules' => 
  array (
    0 => 
    array (
      'time' => -1830387612,
      'type' => 0,
    ),
    1 => 
    array (
      'time' => 308703600,
      'type' => 1,
    ),
    2 => 
    array (
      'time' => 321314400,
      'type' => 0,
    ),
  ),
  'finalRule' => 
  array (
    'type' => 'static',
    'name' => 'WAT',
    'offset' => 3600,
    'startYear' => 1981,
  ),
  'name' => 'Africa/Ndjamena',
);

?>