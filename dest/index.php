<?php

require_once 'vendor/autoload.php';

use Slim\Http\Request as Request;
use Slim\Http\Response as Response;
use MongoDB\Client as MongoClient;

class MDB {
    const DB = 'WDS_statistics_v3';

    public static function get() {
        $mongo = new MongoClient();
        return $mongo->selectDatabase(self::DB);
    }
}

class Category {
    private $name;
    private $year;
    private $month;

    public function __construct(string $name) {
        $this->name = $name;
    }

    public function setYear($year): self {
        $this->year = $year ? (int)$year : null;
        return $this;
    }

    public function setMonth($month): self {
        $this->month = $month ? (int)$month : null;
        return $this;
    }

    private function hasDate(): bool {
        return isset($this->year, $this->month);
    }

    public function get() {
        return $this->hasDate() ? $this->getMonth() : $this->getAlltime();
    }

    private function getAlltime() {
        return $this->getCollection()->find()->toArray();
    }

    private function getMonth() {
        $result = $this->getCollection()->findOne(['_id' => $this->getDate()]);
        return $result ? $result->places : [];
    }

    private function getCollection(): \MongoDB\Collection {
        $collectionName = $this->hasDate() ? 'leaderboard_' . $this->name : 'alltime_' . $this->name;
        return MDB::get()->selectCollection($collectionName);
    }

    private function getDate(): string {
        return sprintf('%d%02d', $this->year, $this->month);
    }
}

class Registry {
    const CATEGORIES = [
        'anoikis_count', 'anoikis_value', 'astero_driver_count', 'astero_driver_value',
        'astero_killer_count', 'astero_killer_value', 'awox_count', 'awox_value',
        'blops_driver_count', 'blops_driver_value', 'blops_killer_count', 'blops_killer_value',
        'bomber_driver_count', 'bomber_driver_value', 'bomber_killer_count', 'bomber_killer_value',
        'bomb_user_count', 'bomb_user_value', 'capital_driver_count', 'capital_driver_value',
        'capital_killer_count', 'capital_killer_value', 'count', 'damage', 'dedication',
        'dictor_driver_count', 'dictor_driver_value', 'dictor_killer_count', 'dictor_killer_value',
        'diversity', 'explorer_count', 'explorer_value', 'fleet_count', 'fleet_value',
        'fw_count', 'fw_value', 'highsec_count', 'highsec_value', 'industrial_driver_count',
        'industrial_driver_value', 'industrial_killer_count', 'industrial_killer_value',
        'lowsec_count', 'lowsec_value', 'miner_driver_count', 'miner_driver_value',
        'miner_killer_count', 'miner_killer_value', 'nestor_driver_count', 'nestor_driver_value',
        'nestor_killer_count', 'nestor_killer_value', 'nullsec_count', 'nullsec_value',
        'pod_driver_count', 'pod_driver_value', 'pod_killer_count', 'pod_killer_value',
        'pure_count', 'pure_value', 'recon_driver_count', 'recon_driver_value',
        'recon_killer_count', 'recon_killer_value', 'solo-count_count', 'solo-value_value',
        'solo_bomber_count', 'solo_bomber_value', 'stratios_driver_count', 'stratios_driver_value',
        'stratios_killer_count', 'stratios_killer_value', 't3c_driver_count', 't3c_driver_value',
        't3c_killer_count', 't3c_killer_value', 't3d_driver_count', 't3d_driver_value',
        't3d_killer_count', 't3d_killer_value', 'codegreen_driver_count', 'codegreen_driver_value',
        'codered_driver_count', 'codered_driver_value', 'trash_killer_count', 'trash_killer_value',
        'thera_count', 'thera_value', 'value', 'transport_killer_count', 'transport_killer_value',
        'transport_driver_count', 'transport_driver_value', 'zkb_points',
    ];

    public static function get(string $year, string $month) {
        $result = [];
        foreach (self::CATEGORIES as $category) {
            $result[$category] = (new Category($category))->setYear($year)->setMonth($month)->get();
        }
        $result['summary'] = MDB::get()->selectCollection('summary')->findOne(['_id' => sprintf('%d%02d', $year, $month)]);
        return $result;
    }
}

$c = new \Slim\Container();

$c['notFoundHandler'] = function ($c) {
    return function ($request, $response) use ($c) {
        return $c['response']->write(file_get_contents('index-view.html'));
    };
};

$app = new \Slim\App($c);

$app->get('/api/category/{category:[0-9a-z\_\-]+}/[{year:20[1-2][0-9]}/{month:[0-9]{1,2}}/]', function (Request $request, Response $response, array $args) {
    $category = new Category($args['category']);
    $category->setYear($args['year'] ?? null)->setMonth($args['month'] ?? null);
    $data = $category->get();
    return $response->withJson($data);
});

$app->get('/api/month/{year:20[1-2][0-9]}/{month:[0-9]{1,2}}/', function (Request $request, Response $response, array $args) {
    return $response->withJson(Registry::get($args['year'], $args['month']));
});

$app->get('/api/summary/', function (Request $request, Response $response, array $args) {
    $data = MDB::get()->summary->findOne(['_id' => 'overall']);
    return $response->withJson($data);
});

$app->get('/api/pilot/names/', function (Request $request, Response $response, array $args) {
    $data = MDB::get()->pilot_names->find()->toArray();
    return $response->withJson($data);
});

$app->get('/api/pilot/medals/', function (Request $request, Response $response, array $args) {
    $data = MDB::get()->pilot_medals->find()->toArray();
    return $response->withJson($data);
});

$app->get('/api/achievements/', function (Request $request, Response $response, array $args) {
    $data = MDB::get()->pilot_achievements->find(['achievements' => ['$exists' => true]])->toArray();
    return $response->withJson($data);
});

$app->post('/api/sso/', function (Request $request, Response $response, array $args) {
    $data = $request->getParsedBody();
    $url = 'https://login.eveonline.com/oauth/verify';
    $headers = ['Authorization' => 'Bearer ' . $data['token']];
    $res = Requests::get($url, $headers);
    return $response->write($res->body);
});

$app->run();
