<?php
class ApiProviderMissingActionException extends AgaviConfigurationException {};
class ApiProviderMissingModuleException extends AgaviConfigurationException {};

class AppKitRoutingHandler extends AgaviRoutingConfigHandler {

    const XML_NAMESPACE = 'http://icinga.org/appkit/config/parts/routing/1.0';

    private $apiProviders = array();

    /**
    * returns the module/action definition of Ext.direct exports in this routing
    * Mainly used for test-cases
    * @returns array	An assoc array with ("module"=>string, "action"=>string elements)
    *
    * @author	Jannis Mosshammer <jannis.mosshammer@netways.de>
    */
    public function getApiProviders() {
        return $this->apiProviders;
    }

    /**
     * Overwrites the default execute method to include module specific 
     * routing definitions with the right context. The XML files are collected 
     * with the AppKit module handler which collects information about a module
     * and provide summary config at request time
     * @see		AgaviRoutingConfigHandler::execute()
     * @author	Marius Hein <marius.hein@netways.de>
     */
    public function execute(AgaviXmlConfigDomDocument $document) {
        // set up our default namespace
        $document->setDefaultNamespace(self::XML_NAMESPACE, 'routing');
        
        $context_name = AgaviConfig::get('core.default_context', 'web');
        
        $entry_xpath_query = '//ae:configurations/ae:configuration'
        . '[@context=\''. $context_name. '\']'
        . '/routing:routes/routing:route[@name=\'modules\']';
        
        AppKitXmlUtil::includeXmlFilesToTarget(
            $document,
            $entry_xpath_query,
            'xmlns(ae=http://agavi.org/agavi/config/global/envelope/1.0) xmlns(r=http://icinga.org/appkit/config/parts/routing/1.0) xpointer(//ae:configurations/ae:configuration[@context=\''. $context_name. '\']/r:routes/node())',
            AppKitModuleUtil::getInstance()->getSubConfig('agavi.include_xml.routing')
        );
        
        $document->xinclude();
        
        return $this->parent_execute($document);
    }

    /**
    * parent::execute would overwrite the routing default namespace with the one agavi uses, so we
    * cannot simply call the parent one (self::XML_NAMESPACE wouldn't refer to http://icinga.org/...)
    * This is just a copy of @See AgaviRoutingConfigHandler::execute and additionally calls the Ext.direct
    * Provider
    *
    * @param 	AgaviXmlConfigDomDocument 	The DOMDocument to parse
    *
    * @author 	Jannis Moßhammer 	<jannis.mosshammer@netways.de>
    *
    **/
    private function parent_execute(AgaviXmlConfigDomDocument $document) {
        $routing = AgaviContext::getInstance($this->context)->getRouting();
        $this->unnamedRoutes = array();
        $routing->importRoutes(array());
        $data = array();

        foreach($document->getConfigurationElements() as $cfg) {
            if($cfg->has('routes')) {
                $this->parseRoutesExtended($routing, $cfg->get('routes'));
                $this->parseApiProviders();
            }
        }

        return serialize($routing->exportRoutes());
    }

    /**
    *	Delegates route-parsing to the inherited AgaviXmlConfigHandler but extracts
    *	information about ext.direct routes
    *
    * @param      AgaviRouting The routing instance to create the routes in.
    * @param      mixed        The "roles" node (element or node list)
    * @param      string       The name of the parent route (if any).
    *
    * @author     Jannis Moßhammer <jannis.mosshammer@netways.de>
    */
    protected function parseRoutesExtended($routing,$routes,$parent = null) {
        foreach($routes as $route) {

            if($route->hasAttribute("api_provider")) {
                $this->fetchApiProviderInformation($route);
            }
        }
        $this->parseRoutes($routing,$routes,$parent = null);
    }

    private function parseApiProviders() {
        if(empty($this->apiProviders))
            return;
        $extdirectParser = new AppKitApiProviderParser();
        $extdirectParser->execute($this->apiProviders);
    }


    /**
    * Extracts module and action information from the current route
    * @param	AgaviDomElement	The route elment to search for
    *
    * @author   Jannis Moßhammer <jannis.mosshammer@netways.de>
    * @throws	MissingModuleException	Indicates that a route without a module should be exported
    * @throws	MissingActionException	Indicates that a route without an action should be exported
    */
    protected function fetchApiProviderInformation(DomElement $route) {
        $module = AppKitXmlUtil::getInheritedAttribute($route, "module");
        $action = AppKitXmlUtil::getInheritedAttribute($route, "action");

        if(!$action) {
            $r = print_r($route->getAttributes(),1);
            throw new ApiProviderMissingActionException("Missing action in route exported for ApiProvider route settings: ".$r);
        }
        if(!$module) {
            $r = print_r($route->getAttributes(),1);
            throw new ApiProviderMissingModuleException("Missing module in route exported for ApiProvider route settings: ".$r);
        }
        if($module != null && $action != null) {
            $toExport = array(
                            "module" => $module,
                            "action" => $action
                        );
            if(!in_array($toExport,$this->apiProviders))
                array_push($this->apiProviders,$toExport);
        }
    }


}

?>