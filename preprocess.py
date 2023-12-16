import pandas as pd

THRESHOLD = 4

# read raw data
actors = pd.read_csv('data/credits.csv')
shows = pd.read_csv('data/titles.csv')

show2actors = dict()
actor2shows = dict()
id2title = dict()
actor_list = set()

for idx, row in actors.iterrows():
    actor_id = row['person_id']
    actor_name = row['name']
    actor_role = row['role']
    show_id = row['id']
    actor_list.add((actor_id, actor_name, actor_role))
    if actor_id not in actor2shows:
        actor2shows[actor_id] = set()
    actor2shows[actor_id].add(show_id)
    if show_id not in show2actors:
        show2actors[show_id] = set()
    show2actors[show_id].add(actor_id)

for idx, row in shows.iterrows():
    id2title[row["id"]] = row["title"]

actor_list = [(actor_id, actor_name, len(actor2shows[actor_id]), actor_role) for actor_id, actor_name, actor_role in list(actor_list)]
actor_ids = [actor[0] for actor in actor_list if actor[2] >= THRESHOLD]

for idx, row in actors.iterrows():
    actor_id = row['person_id']
    show_id = row['id']
    if actor_id in actor_ids:
        if show_id not in show2actors:
            show2actors[show_id] = set()
        show2actors[show_id].add(actor_id)

# build the network of cooperation
id2idx = dict()
for idx, actor_id in enumerate(actor_ids):
    id2idx[actor_id] = idx

edges = dict()
for si, al in show2actors.items():
    al = list(al)
    for i in range(len(al) - 1):
        for j in range(i + 1, len(al)):
            edge_id = str(al[i]) + "_" + str(al[j])
            if edge_id not in edges:
                edges[edge_id] = set()
            edges[edge_id].add(id2title[si])

actor_relations = {
    "actor1": [],
    "actor2": [],
    "shows": [],
    "num": []
}

for edge_id, shows in edges.items():
    # only consider solid collaborations that involves more than 3 movies
    if len(shows) >= THRESHOLD:
        actor_relations["actor1"].append(int(edge_id.split("_")[0]))
        actor_relations["actor2"].append(int(edge_id.split("_")[1]))
        actor_relations["shows"].append(", ".join(list(shows)))
        actor_relations["num"].append(len(shows))

linked_ids = []
linked_ids.extend(actor_relations["actor1"])
linked_ids.extend(actor_relations["actor2"])

selected_actors = {
    "id": [],
    "name": [],
    "role": []
}

for actor in actor_list:
    if actor[0] in linked_ids and actor[0] not in selected_actors["id"]:
        selected_actors["id"].append(actor[0])
        selected_actors["name"].append(actor[1])
        selected_actors["role"].append(actor[3])

df = pd.DataFrame(actor_relations)
df.to_csv('data/actor_relations.csv', index=False)

df2 = pd.DataFrame(selected_actors)
df2.to_csv('data/selected_actors.csv', index=False)
