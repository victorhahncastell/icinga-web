<?php
/**
 * @author Christian Doebler <christian.doebler@netways.de>
 */
class Web_IcingaApiSimpleDataProviderModel extends ICINGAWebBaseModel
{

	private $configAll = false;
	private $config = false;

	private $apiSearch = false;

	private $filter = false;

	private $filterSet = false;

	public function __construct () {
		$this->configAll = AgaviConfig::get('de.icinga.simpledataprovider');
		$this->apiSearch = AppKitFactories::getInstance()->getFactory('IcingaData')->API()->createSearch();
	}

	public function setSourceId ($srcId = false) {
		if (array_key_exists($srcId, $this->configAll)) {
			$this->config = $this->configAll[$srcId];
			$this->setSearchTarget($this->config['target']);
			$this->setResultColumns($this->config['result_columns']);
		}
		return $this;
	}

	public function setFilter ($filter = false) {
		if (is_array($filter)) {
			$this->filter = $filter;
			$this->applyFilter();
		}
		return $this;
	}

	private function applyFilter () {
		if (array_key_exists('filter', $this->config) && $this->config['filter'] !== false) {			
			$filterDefs = (array_key_exists('column', $this->config['filter'])) ? array($this->config['filter']) : $this->config['filter'];
			foreach ($filterDefs as $filter) {
				$apiFilter = array($filter['column'], $filter['value']);
				if (array_key_exists('match_type', $filter)) {
					array_push($apiFilter, constant($filter['match_type']));
				}
				$this->setSearchFilter(array($apiFilter));
			}
			$this->config['filter'] = false;
		}
		if (array_key_exists('user_filters', $this->config) && $this->config['user_filters'] !== false && $this->filter !== false) {
			$filterDefs = $this->config['user_filters'];
			foreach ($this->filter as $key => $value) {
				if (array_key_exists($key, $filterDefs)) {
					$filter = array($filterDefs[$key]['column'], $value);
					if (array_key_exists('match_type', $filterDefs[$key])) {
						array_push($filter, constant($filterDefs[$key]['match_type']));
					}
					$this->setSearchFilter(array($filter));
				}
			}
			$this->config['user_filters'] = false;
		}
		$this->filterSet = true;
		return $this;
	}

	public function fetch () {
		$result = false;
		if ($this->filterSet === true) {
			$result = $this->apiSearch->fetch();
		}
//var_dump(array(
//	'config'	=> $this->config,
//	'result'	=> $result
//));
		return $result;
	}

	/*
	 * API WRAPPERS
	 */
	private function setSearchTarget ($target) {
		$this->apiSearch->setSearchTarget(constant($target));
		return $this;
	}

	private function setSearchFilter ($filter, $value = false, $defaultMatch = IcingaApi::MATCH_EXACT) {
		if ($defaultMatch != IcingaApi::MATCH_EXACT && defined($defaultMatch)) {
			$defaultMatch = constant($defaultMatch);
		}
		$this->apiSearch->setSearchFilter($filter, $value, $defaultMatch);
		return $this;
	}

	private function setResultColumns ($column) {
		$this->apiSearch->setResultColumns($column);
		return $this;
	}

}

?>